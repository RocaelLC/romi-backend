import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  async create(patientId: string, dto: CreateAppointmentDto) {
    const when = new Date(dto.scheduledAt);
    if (isNaN(when.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO-8601 datetime');
    }

    const status = dto.status && Object.values(AppointmentStatus).includes(dto.status as AppointmentStatus)
      ? (dto.status as AppointmentStatus)
      : AppointmentStatus.PENDING;

    const appt = this.repo.create({
      patientId,
      doctorId: dto.doctorId,
      scheduledAt: when,
      reason: dto.reason ?? null,
      status,
    });
    return this.repo.save(appt);
  }

  async findByDoctor(params: {
    doctorId: string;
    status?: string;
    from?: string;
    to?: string;
    page: number;
    size: number;
  }) {
    const where: FindOptionsWhere<Appointment> = { doctorId: params.doctorId };
    if (params.status) where.status = params.status as AppointmentStatus;
    if (params.from && params.to) {
      where.scheduledAt = Between(new Date(params.from), new Date(params.to));
    }
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { scheduledAt: 'ASC' },
      skip: (params.page - 1) * params.size,
      take: params.size,
    });
    return { items, total, page: params.page, size: params.size };
  }

  async findOne(id: string) {
    const appt = await this.repo.findOne({ where: { id } });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appt = await this.findOne(id);
    if ([AppointmentStatus.CANCELED, AppointmentStatus.COMPLETED].includes(appt.status)) {
      throw new BadRequestException('Appointment is already finalized.');
    }
    appt.status = status;
    return this.repo.save(appt);
  }
}
