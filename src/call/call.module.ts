import { Module } from "@nestjs/common";
import { CallGateway } from "./call.ws";
import { AppointmentsModule } from "../appointments/appointments.module";

@Module({
  imports: [AppointmentsModule],
  providers: [CallGateway],
})
export class CallModule {}

