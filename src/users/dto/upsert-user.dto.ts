import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleName } from '../../roles/role.entity';

export class UpsertUserDto {
  @IsOptional() @IsString()
  name?: string;

  @IsEmail()
  email!: string;

  @IsOptional() @MinLength(6)
  password?: string;

  @IsEnum(RoleName)
  role!: RoleName;
}
