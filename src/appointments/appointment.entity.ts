import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { AppointmentStatus } from '../common/enums';
import { EventLog } from '../events/event-log.entity';
export { AppointmentStatus } from '../common/enums';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_appointment_patient')
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: User;
  @Column('uuid') patientId: string;

  @Index('idx_appointment_doctor')
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;
  @Column('uuid') doctorId: string;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status_enum',
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  notes?: Array<{ authorId: string; text: string; createdAt: string }> | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  chatSessionId?: string | null;

  @OneToMany(() => EventLog, (event) => event.appointment)
  events?: EventLog[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
