import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Group } from "./groupChat";
import { User } from "./user";
import { MessageStatus } from "../other/MessageStatus";

@Entity()
export class GroupMessage {
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

  @ManyToOne(() => Group)
  group!: Group;

  @ManyToOne(() => User)
  sender!: User;
}
