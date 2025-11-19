import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import jwt from "jsonwebtoken";

type ClientMsg = { type: "user_message"; text: string };
type BotMsg = { type: "bot_message"; text: string } | { type: "typing"; on: boolean };

@WebSocketGateway({ path: "/chat", cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  handleConnection(ws: WebSocket, req?: any) {
    try {
      const url = new URL(req?.url ?? "", "http://localhost");
      const token = url.searchParams.get("token");
      if (token && process.env.JWT_SECRET) {
        try { jwt.verify(token, process.env.JWT_SECRET); } catch {}
      }
    } catch {}
    console.log("[WS] Cliente conectado");
    ws.send(JSON.stringify({ type: "bot_message", text: "Hola, soy ROMI 🩺. ¿En qué puedo ayudarte hoy?" } as BotMsg));
  }

  handleDisconnect(_: WebSocket) {
    console.log("[WS] Cliente desconectado");
  }

  private async askAzure(userText: string): Promise<string> {
    const endpoint   = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey     = process.env.AZURE_OPENAI_API_KEY!;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const body = {
      messages: [
        { role: "system", content: "Eres ROMI IA, triage previo a videoconsulta: pregunta motivo y síntomas clave, pide antecedentes, y resume para el médico." },
        { role: "user", content: userText },
      ],
      temperature: 0.3,
      max_tokens: 700,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[Azure] Error", res.status, text);
      throw new Error(`Azure ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "No tengo respuesta ahora.";
  }

  afterInit(server: Server) {
    console.log("[WS] Gateway inicializado en /chat");
    server.on("connection", (ws: WebSocket, req) => {
      console.log("[WS] Nueva conexión:", req?.url);
      ws.on("message", async (raw) => {
        try {
          const data = JSON.parse(String(raw)) as ClientMsg;
          if (data.type === "user_message" && data.text?.trim()) {
            try { ws.send(JSON.stringify({ type: "typing", on: true } as BotMsg)); } catch {}
            const reply = await this.askAzure(data.text.trim());
            try { ws.send(JSON.stringify({ type: "typing", on: false } as BotMsg)); } catch {}
            ws.send(JSON.stringify({ type: "bot_message", text: reply } as BotMsg));
          }
        } catch (e) {
          console.error("[WS] Error payload:", e);
          try { ws.send(JSON.stringify({ type: "bot_message", text: "No pude leer tu mensaje." } as BotMsg)); } catch {}
        }
      });
    });
  }
}
