import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role, RoleName } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findByName(name: RoleName) {
    return this.repo.findOne({ where: { name } });
  }

  async ensure(names: RoleName[]) {
    const existing = await this.repo.find({ where: { name: In(names) } });
    const missing = names.filter((n) => !existing.find((r) => r.name === n));
    if (missing.length) {
      await this.repo.save(missing.map((name) => this.repo.create({ name })));
    }
    return this.repo.find({ where: { name: In(names) } });
  }

  async getOrCreate(name: RoleName) {
    let role = await this.findByName(name);
    if (!role) {
      role = await this.repo.save(this.repo.create({ name }));
    }
    return role;
  }

  async mustGet(name: RoleName) {
    const role = await this.findByName(name);
    if (!role) throw new NotFoundException(`Role ${name} not found`);
    return role;
  }
}
