"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
let ChatGateway = class ChatGateway {
    handleConnection(_) { }
    handleDisconnect(_) { }
    afterInit(server) {
        server.on("connection", (ws) => {
            ws.on("message", (raw) => {
                try {
                    const data = JSON.parse(String(raw));
                    if (data.type === "user_message") {
                        const reply = `Entiendo: "${data.text}". Estoy aquí para orientarte.`;
                        ws.send(JSON.stringify({ type: "bot_message", text: reply }));
                    }
                }
                catch {
                    ws.send(JSON.stringify({ type: "bot_message", text: "No pude leer tu mensaje." }));
                }
            });
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.Server)
], ChatGateway.prototype, "server", void 0);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: "/chat" })
], ChatGateway);
