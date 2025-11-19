import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { NotificationType } from '../common/enums';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_notification_user')
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: NotificationType, enumName: 'notification_type_enum' })
  type: NotificationType;

  @Column('uuid', { name: 'appointment_id', nullable: true })
  appointmentId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
