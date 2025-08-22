import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";

type Payload = { type: "user_message"; text: string };

@WebSocketGateway({ path: "/chat" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  handleConnection(_: WebSocket) {}
  handleDisconnect(_: WebSocket) {}

  afterInit(server: Server) {
    server.on("connection", (ws: WebSocket) => {
      ws.on("message", (raw) => {
        try {
          const data = JSON.parse(String(raw)) as Payload;
          if (data.type === "user_message") {
            const reply = `Entiendo: "${data.text}". Estoy aquí para orientarte.`;
            ws.send(JSON.stringify({ type: "bot_message", text: reply }));
          }
        } catch {
          ws.send(JSON.stringify({ type: "bot_message", text: "No pude leer tu mensaje." }));
        }
      });
    });
  }
}
