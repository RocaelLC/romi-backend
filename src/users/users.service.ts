import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role, RoleName } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { DoctorListItemDto } from './dto/doctor-list-item.dto';
import { DoctorProfile } from '../users/doctor-profile.entity';
import { UserWithRoles } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfileRepo: Repository<DoctorProfile>,
  ) {}

  async findById(id: string): Promise<UserWithRoles | null> {
    const user = await this.usersRepository.findOne({
      where: { id } as any,
      relations: ['role', 'roles'],
    });
    return (user as unknown) as UserWithRoles | null;
  }

  async createUserWithRoles(dto: RegisterDto): Promise<User> {
    const desired: RoleName = dto.role === 'doctor' ? RoleName.DOCTOR : RoleName.PATIENT;

    const roleEntity =
      (await this.rolesRepository.findOne({ where: { name: desired } })) ||
      (await this.rolesRepository.save(this.rolesRepository.create({ name: desired })));

    const password_hash = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password_hash,
      role: roleEntity,
    });
    const saved = await this.usersRepository.save(newUser);

    if (desired === RoleName.DOCTOR) {
      const languages = Array.isArray(dto.languages)
        ? dto.languages
        : typeof (dto as any).languages === 'string'
        ? (dto as any).languages
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined;

      const profile = this.doctorProfileRepo.create({
        user: saved,
        specialty: dto.specialty || 'General',
        city: dto.city ?? null,
        languages: languages ?? null,
        price: dto.price ?? null,
        yearsExp: dto.yearsExp ?? null,
        nextAvailable: dto.nextAvailable ?? null,
        rating: null,
        isAvailable: true,
      });
      await this.doctorProfileRepo.save(profile);
    }

    return saved;
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithRoles(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password_hash')
      .leftJoinAndSelect('user.role', 'role')
      .getOne();
  }

  findByExternalId(externalId: string) {
    return this.usersRepository.findOne({ where: { externalId } });
  }

  findWithRole(id: string) {
    return this.usersRepository.findOne({
      where: { id } as any,
      relations: ['role'],
    });
  }

  async listDoctorsPublic(): Promise<DoctorListItemDto[]> {
    const rows = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role', 'role.name = :name', { name: RoleName.DOCTOR })
      .leftJoinAndSelect('user.doctorProfile', 'profile')
      .select([
        'user.id',
        'user.name',
        'profile.id',
        'profile.specialty',
        'profile.city',
        'profile.languages',
        'profile.price',
        'profile.rating',
        'profile.yearsExp',
        'profile.nextAvailable',
        'profile.isAvailable',
      ])
      .orderBy('user.created_at', 'DESC')
      .getMany();

    return rows.map((u) => ({
      id: (u as any).id,
      name: u.name ?? 'Sin nombre',
      specialty: (u as any).doctorProfile?.specialty ?? 'General',
      city: (u as any).doctorProfile?.city ?? null,
      languages: (u as any).doctorProfile?.languages ?? null,
      price: (u as any).doctorProfile?.price ?? null,
      rating: (u as any).doctorProfile?.rating ?? null,
      years_exp: (u as any).doctorProfile?.yearsExp ?? null,
      next_available: (u as any).doctorProfile?.nextAvailable ?? null,
      is_available: (u as any).doctorProfile?.isAvailable ?? null,
    }));
  }

  async listDoctors() {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .where('role.name = :name', { name: RoleName.DOCTOR })
      .orderBy('user.created_at', 'DESC')
      .getMany();
  }
}

