import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "varchar", length: 8, default: "web" })
  channel!: "web" | "wa";

  @Column({ type: "varchar", length: 16, default: "low" })
  risk_level!: "low" | "medium" | "high";

  @CreateDateColumn({ type: "timestamptz" })
  started_at!: Date;

  @Column({ type: "timestamptz", nullable: true })
  ended_at!: Date | null;
}
