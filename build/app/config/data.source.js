"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const message_1 = require("../entities/message");
const user_1 = require("../entities/user");
const chat_1 = require("../entities/chat");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "postgres_db",
    port: 5432,
    username: "postgres",
    password: "root",
    database: "db_chats",
    synchronize: true,
    logging: false,
    entities: [message_1.Message, user_1.User, chat_1.Chat],
    migrations: [],
    subscribers: [],
});
