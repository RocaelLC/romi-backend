import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @Get(':id')
  @Roles('DOCTOR')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/status')
  @Roles('DOCTOR')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
