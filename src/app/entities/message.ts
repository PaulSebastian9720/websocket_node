import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Chat } from "./chat";
import { User } from "./user";
import { MessageStatus } from "../other/MessageStatus";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status!: MessageStatus;

  @ManyToOne(() => Chat)
  chat!: Chat;

  @ManyToOne(() => User)
  sender!: User;
}
