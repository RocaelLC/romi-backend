import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('doctor_profile')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  specialty: string;

  @Column({ length: 120, nullable: true })
  city?: string | null;

  // Si no usas Postgres, guarda como string CSV y luego lo parseas
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[] | null; // ej: "Español,Inglés"

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number | null;

  @Column({ type: 'float', nullable: true })
  rating?: number | null;

  @Column({ type: 'int', nullable: true })
  yearsExp?: number | null;

  @Column({ length: 60, nullable: true })
  nextAvailable?: string | null;

  @Column({ type: 'boolean', default: true })
  isAvailable?: boolean | null;

  @OneToOne(() => User, (u) => u.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
