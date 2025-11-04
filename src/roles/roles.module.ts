// src/roles/roles.module.ts 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { User } from '../users/user.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesSeed } from './roles.seed';

@Module({
  imports: [
    // Registramos Role y (opcionalmente) User porque hay relación.
    TypeOrmModule.forFeature([Role, User]),
  ],
  providers: [RolesService, RolesSeed],
  controllers: [RolesController],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
