import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { DoctorProfile } from '../users/doctor-profile.entity';
import { Notification } from '../notifications/notification.entity';
@Entity('users')
export class User {
  @OneToOne(() => DoctorProfile, (p) => p.user, { cascade: true, eager: false })
  doctorProfile?: DoctorProfile;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 255 })
  password_hash!: string;

  // opcional pero tus servicios lo usan
  @Column({ length: 100, nullable: true })
  name?: string;

  // opcional: si más adelante usas “login externo”
  @Column({ name: 'external_id', nullable: true, unique: true })
  externalId?: string;

  @ManyToOne(() => Role, (r) => r.users, { eager: true, nullable: false })
  role!: Role;

  @OneToMany(() => Notification, (n) => n.user)
  notifications?: Notification[];

  
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
  appointmentsAsDoctor: any;
  appointmentsAsPatient: any;
}
