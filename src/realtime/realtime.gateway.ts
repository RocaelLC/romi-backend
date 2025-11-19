import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server?: Server; 

  handleConnection(socket: Socket) {
    console.log('Cliente conectado:', socket.id);
   
  }

  handleDisconnect(socket: Socket) {
    console.log('Cliente desconectado:', socket.id);
  }

  emitNotification(userId: string, notification: any) {
    const s: any = this.server;

    if (!s || typeof s.to !== 'function') {
      console.warn(
        '[RealtimeGateway] server.to no está disponible, omitiendo notificación realtime',
      );
      return;
    }

    s.to(`user:${userId}`).emit('notification', notification);
  }
}
