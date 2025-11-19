import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog } from './event-log.entity';
import { EventKind } from '../common/enums';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventLog)
    private readonly repo: Repository<EventLog>,
  ) {}

  async log(params: {
    appointmentId: string;
    kind: EventKind;
    message: string;
    actorUserId?: string | null;
    payload?: Record<string, any>;
  }) {
    const entry = this.repo.create({
      appointmentId: params.appointmentId,
      kind: params.kind,
      message: params.message,
      actorUserId: params.actorUserId ?? null,
      payload: params.payload ?? null,
    });
    return this.repo.save(entry);
  }

  async listByAppointment(appointmentId: string) {
    return this.repo.find({
      where: { appointmentId },
      order: { createdAt: 'ASC' },
    });
  }
}
