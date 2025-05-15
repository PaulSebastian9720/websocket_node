import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from "typeorm";
import { User } from "./user";

@Entity()
@Unique(["user1", "user2"])
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user1!: User;

  @ManyToOne(() => User)
  user2!: User;
}
