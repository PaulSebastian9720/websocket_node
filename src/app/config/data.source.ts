import "reflect-metadata";
import { DataSource } from "typeorm";
import { Message } from "../entities/message";
import { User } from "../entities/user";
import { Chat } from "../entities/chat";
import { Group } from "../entities/groupChat";
import { GroupMessage } from "../entities/groupMessages";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "postgres_db",
  port: 5432,
  username: "postgres",
  password: "root",
  database: "db_chats",
  synchronize: true,
  logging: false,
  entities: [Message, User, Chat, Group, GroupMessage],
  migrations: [],
  subscribers: [],
});
