import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { AppointmentsService } from "../appointments/appointments.service";

type RoleParam = "doctor" | "patient";

type SignalMsg =
  | { type: "join"; appointmentId: string; role: RoleParam }
  | { type: "sdp-offer"; sdp: any }
  | { type: "sdp-answer"; sdp: any }
  | { type: "ice-candidate"; candidate: any }
  | { type: "alert"; level: "info" | "warn" | "critical"; text: string }
  | { type: "details"; diagnosis: string; prescription: string[]; followUp: string };

type SystemMsg = { type: "system"; text: string };

type Room = { doctor?: WebSocket; patient?: WebSocket };

@Injectable()
@WebSocketGateway({ path: "/call", cors: { origin: "*" } })
export class CallGateway {
  @WebSocketServer() server!: Server;

  private rooms = new Map<string, Room>();

  constructor(private readonly appointments: AppointmentsService) {}

  private send(ws: WebSocket | undefined, data: any) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try { ws.send(JSON.stringify(data)); } catch {}
  }

  private broadcastCounterpart(aid: string, from: RoleParam, data: any) {
    const room = this.rooms.get(aid);
    if (!room) return;
    const to = from === "doctor" ? room.patient : room.doctor;
    this.send(to, data);
  }

  private async authorize(aid: string, role: RoleParam, token?: string): Promise<{ ok: boolean; reason?: string; sub?: string; roles?: string[] }> {
    try {
      if (!token) return { ok: false, reason: 'Falta token' };
      const secret = process.env.JWT_SECRET || 'dev_secret';
      const decoded: any = jwt.verify(token, secret);
      const appt = await this.appointments.findOne(aid);
      if (!appt) return { ok: false, reason: 'Cita no encontrada' };
      const sub = decoded?.sub as string | undefined;
      const roles: string[] = (decoded?.roles ?? []).map((r: any) => String(r).toUpperCase());
      if (!sub) return { ok: false, reason: 'Token sin sub' };
      const demo = process.env.CALL_DEMO_MODE === 'true' || process.env.CALL_DEMO_MODE === '1';
      if (!demo) {
        if (role === 'doctor' && sub !== (appt as any).doctorId) return { ok: false, reason: 'No es el doctor de la cita' };
        if (role === 'patient' && sub !== (appt as any).patientId) return { ok: false, reason: 'No es el paciente de la cita' };
      }
      return { ok: true, sub, roles };
    } catch (e: any) {
      return { ok: false, reason: e?.message || 'Token inválido' };
    }
  }

  afterInit(server: Server) {
    server.on("connection", async (ws: WebSocket, req) => {
      try {
        const url = new URL(req?.url ?? "", "http://localhost");
        const aid = url.searchParams.get("aid") || "";
        const role = (url.searchParams.get("role") as RoleParam) || "patient";
        const token = url.searchParams.get("token") || undefined;

        const auth = await this.authorize(aid, role, token);
        if (!aid || !auth.ok) {
          const why = !aid ? 'Falta appointmentId' : (auth.reason || 'No autorizado');
          console.warn('[CALL] Reject', { aid, role, reason: why });
          this.send(ws, { type: "system", text: `No autorizado: ${why}` } as SystemMsg);
          ws.close();
          return;
        }

        const room = this.rooms.get(aid) ?? {};
        if (role === "doctor") room.doctor = ws; else room.patient = ws;
        this.rooms.set(aid, room);
        this.broadcastCounterpart(aid, role, { type: "system", text: `${role} conectado` } as SystemMsg);

        ws.on("message", (raw) => {
          try {
            const msg = JSON.parse(String(raw)) as SignalMsg;
            if (msg.type === "sdp-offer" || msg.type === "sdp-answer" || msg.type === "ice-candidate" || msg.type === "alert" || msg.type === "details") {
              this.broadcastCounterpart(aid, role, msg);
            }
          } catch {}
        });

        ws.on("close", () => {
          const r = this.rooms.get(aid);
          if (!r) return;
          if (r.doctor === ws) r.doctor = undefined; else if (r.patient === ws) r.patient = undefined;
          this.rooms.set(aid, r);
          this.broadcastCounterpart(aid, role, { type: "system", text: `${role} desconectado` } as SystemMsg);
        });
      } catch {}
    });
  }
}
