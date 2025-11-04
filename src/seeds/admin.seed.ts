import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role, RoleName } from '../roles/role.entity';

@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Role) private roles: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    const email = 'admin@romi.local';
    const exists = await this.users.findOne({ where: { email } });
    if (exists) return;

    const adminRole = await this.roles.findOne({ where: { name: RoleName.ADMIN } })
      ?? await this.roles.save(this.roles.create({ name: RoleName.ADMIN }));

    const password_hash = await bcrypt.hash('admin123', 10);
    await this.users.save(this.users.create({
      email, name: 'Admin', password_hash, role: adminRole,
    }));
    // console.log('Admin seeded: admin@romi.local / admin123');
  }
}
