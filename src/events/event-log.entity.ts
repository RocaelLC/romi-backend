import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { User } from '../users/user.entity';
import { EventKind } from '../common/enums';

@Entity({ name: 'event_logs' })
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_eventlog_appointment')
  @ManyToOne(() => Appointment, (appointment) => appointment.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
  @Column('uuid')
  appointmentId: string;

  @Index('idx_eventlog_actor')
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actor?: User | null;
  @Column('uuid', { name: 'actor_user_id', nullable: true })
  actorUserId?: string | null;

  @Column({ type: 'enum', enum: EventKind, enumName: 'event_kind_enum' })
  kind: EventKind;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
