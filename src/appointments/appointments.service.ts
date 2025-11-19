import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../events/events.service';
import { EventKind, NotificationType } from '../common/enums';
import { BadRequestException, ForbiddenException, NotFoundException, Injectable } from '@nestjs/common';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly notifications: NotificationsService,
    private readonly events: EventsService,
  ) {}

  async create(patientId: string, dto: CreateAppointmentDto) {
    const when = new Date(dto.scheduledAt);
    if (isNaN(when.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO-8601 datetime');
    }

    const status =
      dto.status && Object.values(AppointmentStatus).includes(dto.status as AppointmentStatus)
        ? (dto.status as AppointmentStatus)
        : AppointmentStatus.PENDING;

    const appt = this.repo.create({
      patientId,
      doctorId: dto.doctorId,
      scheduledAt: when,
      reason: dto.reason ?? null,
      status,
    });

    const saved = await this.repo.save(appt);

    await this.events.log({
      appointmentId: saved.id,
      kind: EventKind.APPOINTMENT_CREATED,
      message: 'Cita creada',
      actorUserId: patientId,
      payload: { status },
    });

    await this.notifications.notifyUser(dto.doctorId, {
      title: 'Nueva cita agendada',
      body: `Tienes una cita programada para ${when.toLocaleString()}`,
      type: NotificationType.APPT_CREATED,
      appointmentId: saved.id,
    });

    return saved;
  }

  async deleteByPatient(id: string, patientId: string) {
    const appt = await this.repo.findOne({ where: { id } });

    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }

    if (appt.patientId !== patientId) {
      throw new ForbiddenException('This appointment is not yours');
    }

    // Evita eliminar citas que ya fueron atendidas
    if (appt.status === AppointmentStatus.ATTENDED) {
      throw new BadRequestException('Completed appointments cannot be deleted');
    }

    await this.repo.remove(appt);

    return { success: true };
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

  async findByPatient(params: {
    patientId: string;
    status?: string;
    from?: string;
    to?: string;
    page: number;
    size: number;
  }) {
    const where: FindOptionsWhere<Appointment> = { patientId: params.patientId };

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

  async updateStatus(id: string, actorUserId: string, status: AppointmentStatus) {
    const appt = await this.findOne(id);

    if ([AppointmentStatus.CANCELLED, AppointmentStatus.ATTENDED].includes(appt.status)) {
      throw new BadRequestException('Appointment is already finalized.');
    }

    appt.status = status;
    const saved = await this.repo.save(appt);

    await this.events.log({
      appointmentId: saved.id,
      kind: EventKind.APPOINTMENT_STATUS_CHANGED,
      message: `Estado actualizado a ${status}`,
      actorUserId,
      payload: { status },
    });

    await this.notifications.notifyAppointmentStatus(saved.id, status);

    return saved;
  }

  async addNote(apptId: string, actorUserId: string, note: string) {
    const appt = await this.findOne(apptId);

    const entry = {
      authorId: actorUserId,
      text: note,
      createdAt: new Date().toISOString(),
    };

    const notes = Array.isArray(appt.notes) ? appt.notes : [];
    appt.notes = [...notes, entry];

    const saved = await this.repo.save(appt);

    await this.events.log({
      appointmentId: saved.id,
      kind: EventKind.APPOINTMENT_NOTE_ADDED,
      message: 'Nota clínica añadida',
      actorUserId,
      payload: entry,
    });

    return saved;
  }

  async listDoctorHistory(params: {
    doctorId: string;
    from?: Date;
    to?: Date;
    patientId?: string;
  }) {
    const where: FindOptionsWhere<Appointment> = {
      doctorId: params.doctorId,
      status: AppointmentStatus.ATTENDED,
    };

    if (params.patientId) where.patientId = params.patientId;
    if (params.from && params.to) {
      where.scheduledAt = Between(params.from, params.to);
    }

    return this.repo.find({
      where,
      relations: ['patient', 'events'],
      order: { scheduledAt: 'DESC' },
    });
  }
}
