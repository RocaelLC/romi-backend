import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus; // ACCEPTED | REJECTED | CANCELLED | ATTENDED
}
