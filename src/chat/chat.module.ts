import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.ws";
@Module({ providers: [ChatGateway] })
export class ChatModule {}
