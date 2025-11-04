import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  doctor_user_id!: string;

  @Column({ type: 'timestamptz' })
  start!: Date;

  @Column({ type: 'timestamptz' })
  end!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
