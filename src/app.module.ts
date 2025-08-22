import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Session } from "./entities/session.entity";
import { Message } from "./entities/message.entity";
import { ChatModule } from "./chat/chat.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || "romi",
        password: process.env.DB_PASS || "romi_password",
        database: process.env.DB_NAME || "romi_db",
        entities: [User, Session, Message],
        synchronize: true, // SOLO desarrollo. En prod: false + migrations.
      }),
    }),
    TypeOrmModule.forFeature([User, Session, Message]),
    ChatModule,
    HealthModule,
  ],
})
export class AppModule {}
