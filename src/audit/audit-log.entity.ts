import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  actor_id!: string;

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'varchar', length: 64 })
  entity!: string;

  @Column({ type: 'uuid' })
  entity_id!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  ts!: Date;
}
