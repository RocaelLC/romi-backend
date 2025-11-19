import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AddNoteDto } from './dto/add-note.dto';
import { DoctorHistoryQueryDto } from './dto/doctor-history.dto';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe, Delete } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @Roles('PATIENT')
  create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    const patientId = req.user.sub;
    return this.service.create(patientId, dto);
  }
  @Delete(':id')
  @Roles('PATIENT')
  removeAsPatient(@Param('id') id: string, @Req() req: any) {
    const patientId = req.user.sub;
    return this.service.deleteByPatient(id, patientId);
  }

  @Get('doctor/:doctorId')
  @Roles('DOCTOR')
  findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('size') size = '10',
  ) {
    return this.service.findByDoctor({
      doctorId,
      status,
      from,
      to,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  }

  @Get('patient')
  @Roles('PATIENT')
  findByPatient(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('size') size = '10',
  ) {
    const patientId = req.user.sub;
    return this.service.findByPatient({
      patientId,
      status,
      from,
      to,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  }

  @Get(':id')
  @Roles('DOCTOR')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @Roles('DOCTOR')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto, @Req() req: any) {
    return this.service.updateStatus(id, req.user.sub, dto.status);
  }

  @Post(':id/notes')
  @Roles('DOCTOR')
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Req() req: any) {
    return this.service.addNote(id, req.user.sub, dto.note);
  }

  @Get('history/me')
  @Roles('DOCTOR')
  history(@Req() req: any, @Query() query: DoctorHistoryQueryDto) {
    return this.service.listDoctorHistory({
      doctorId: req.user.sub,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      patientId: query.patientId,
    });
  }
}
