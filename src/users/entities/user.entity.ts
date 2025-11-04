import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string; // si usas B2C puedes dejarlo null

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;
}
