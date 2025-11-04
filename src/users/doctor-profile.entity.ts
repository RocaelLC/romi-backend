import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('doctor_profile')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // strings: especificar type para evitar "Object"
  @Column({ type: 'varchar', length: 120 })
  specialty!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city?: string | null;

  // Postgres soporta simple-array (guarda "Español,Inglés")
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[] | null;

  // números
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price?: number | null;

  @Column({ type: 'double precision', nullable: true })
  rating?: number | null;

  @Column({ type: 'integer', nullable: true })
  yearsExp?: number | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nextAvailable?: string | null;

  @Column({ type: 'boolean', default: true })
  isAvailable?: boolean | null;

  // relación 1:1 con User (FK en esta tabla)
  @OneToOne(() => User, (u) => u.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
