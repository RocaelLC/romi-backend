import { IsUUID, IsDateString, IsOptional, IsString, Length, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
