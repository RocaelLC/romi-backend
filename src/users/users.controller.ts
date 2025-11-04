import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './role.enum';
import { DoctorListItemDto } from './dto/doctor-list-item.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  ping(@Query('email') email?: string) {
    if (email) return this.users.findByEmail(email);
    return { ok: true };
  }

  @Get('by-external/:sub')
  findByExternal(@Param('sub') sub: string) {
    return this.users.findByExternalId(sub);
  }

  @Get('doctors')
  async listDoctors(): Promise<DoctorListItemDto[]> {
    return this.users.listDoctorsPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin-only')
  @Roles(Role.ADMIN)
  adminOnly() {
    return { ok: true, scope: 'ADMIN' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('scope/doctors')
  @Roles(Role.ADMIN, Role.DOCTOR)
  doctorsScope() {
    return { ok: true, scope: 'ADMIN|DOCTOR' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
