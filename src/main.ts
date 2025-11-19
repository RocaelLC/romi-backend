import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usa el adaptador ws nativo
  app.useWebSocketAdapter(new WsAdapter(app));

  // Permite solicitudes del frontend local
  app.enableCors({
    origin: ['http://localhost:3000'],      
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    credentials: true,                      
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`HTTP  : http://localhost:${port}`);
  console.log(`WS    : ws://localhost:${port}/chat`);
}
bootstrap();
