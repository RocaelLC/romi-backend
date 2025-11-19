import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CallModule } from './call/call.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'romi',
      password: process.env.DB_PASS || 'romi_password',
      database: process.env.DB_NAME || 'romi_db',
      autoLoadEntities: true,
      synchronize: true, // solo DEV
    }),
    RolesModule,
    UsersModule,
    AuthModule,
    AppointmentsModule,
    CallModule,
    ChatModule,
    NotificationsModule,
    RealtimeModule,
    CronModule,
  ],
})
export class AppModule {}
