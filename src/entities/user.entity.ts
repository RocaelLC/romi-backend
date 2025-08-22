import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  phone_hash!: string | null;

  @Column({ type: "varchar", length: 32, default: "anonymous" })
  role!: "anonymous" | "patient" | "professional" | "operations" | "admin";

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
