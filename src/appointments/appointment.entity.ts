import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: User;
  @Column('uuid') patientId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;
  @Column('uuid') doctorId: string;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', length: 40, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
