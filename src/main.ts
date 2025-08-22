import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));   // 👈 fuerza usar "ws"
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`HTTP running on http://localhost:${port}`);
}
bootstrap();
