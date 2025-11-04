import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(action: string, actorId?: string, entity?: string, entityId?: string, payload?: any, ip?: string) {
    const entry = this.repo.create({ action, actor_id: actorId, entity, entity_id: entityId, payload, ip });
    await this.repo.save(entry);
  }
}
