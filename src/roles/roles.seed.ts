import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role, RoleName } from './role.entity';

@Injectable()
export class RolesSeed implements OnApplicationBootstrap {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async onApplicationBootstrap() {
    const desired = Object.values(RoleName);
    const existing = await this.repo.find({ where: { name: In(desired) } });
    const missing = desired.filter((n) => !existing.find((r) => r.name === n));
    if (missing.length) {
      await this.repo.save(missing.map((name) => this.repo.create({ name })));
    }
  }
}
