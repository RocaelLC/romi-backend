import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // Add lowercase variant to satisfy Access-Control-Request-Headers: authorization
    allowedHeaders: ['Content-Type', 'Authorization', 'authorization'],
    optionsSuccessStatus: 204,
  });

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
