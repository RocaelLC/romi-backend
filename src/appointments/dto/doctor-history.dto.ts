import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DoctorHistoryQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  patientId?: string;
}
