import { IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsOptional() @IsString() name?: string;

  @IsEmail() email!: string;

  @IsString() @MinLength(6)
  password!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn(['doctor','patient'])
  role!: 'doctor' | 'patient';

  // ---- Campos solo obligatorios si role === 'doctor' ----
  @ValidateIf(o => o.role === 'doctor')
  @IsString()
  specialty?: string;

  @ValidateIf(o => o.role === 'doctor')
  @IsOptional()
  @IsString()
  city?: string;

  @ValidateIf(o => o.role === 'doctor')
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ValidateIf(o => o.role === 'doctor')
  @IsOptional()
  @IsNumber()
  price?: number;

  @ValidateIf(o => o.role === 'doctor')
  @IsOptional()
  @IsNumber()
  yearsExp?: number;

  @ValidateIf(o => o.role === 'doctor')
  @IsOptional()
  @IsString()
  nextAvailable?: string;
}
