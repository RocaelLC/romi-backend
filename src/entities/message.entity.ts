import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  session_id!: string;

  @Column({ type: "varchar", length: 8 })
  from!: "user" | "bot" | "agent";

  @Column({ type: "text" })
  text!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
