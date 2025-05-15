"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerBootstrap = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const data_source_1 = require("./config/data.source");
const message_service_1 = require("./service/message.service");
const user_service_1 = require("./service/user.service");
const chat_service_1 = require("./service/chat.service");
class ServerBootstrap {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = 3000;
        this.server = http_1.default.createServer(this.app);
        this.messageService = new message_service_1.MessageService();
        this.userService = new user_service_1.UserService();
        this.chatService = new chat_service_1.ChatService();
        this.wss = new ws_1.WebSocketServer({ server: this.server });
        this.clients = new Map();
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield data_source_1.AppDataSource.initialize();
                console.log("Base de datos conectada");
            }
            catch (error) {
                console.error("Error al conectar BD:", error);
            }
        });
    }
    setupWebSocket() {
        this.wss.on("connection", (ws) => {
            console.log("Cliente conectado");
            ws.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const parsed = JSON.parse(data.toString());
                    const { type } = parsed;
                    if (type === "init") {
                        const { senderName, receiverName } = parsed;
                        const sender = yield this.userService.findOrCreate(senderName);
                        const receiver = yield this.userService.findOrCreate(receiverName);
                        const chat = yield this.chatService.getOrCreateChat(sender, receiver);
                        this.clients.set(ws, {
                            ws,
                            userName: sender.userName,
                            chatId: chat.id,
                        });
                        const history = yield this.messageService.getMessagesByChat(chat.id);
                        ws.send(JSON.stringify({
                            type: "history",
                            messages: history,
                            chatId: chat.id,
                        }));
                    }
                    else if (type === "message") {
                        const { chatId, content, senderName } = parsed;
                        const sender = yield this.userService.findOrCreate(senderName);
                        const chat = yield this.chatService.findOne(chatId);
                        if (!chat)
                            throw new Error("Chat no encontrado");
                        const savedMessage = yield this.messageService.createMessage(content, chat, sender);
                        const messageToSend = {
                            type: "message",
                            message: {
                                id: savedMessage.id,
                                content: savedMessage.content,
                                createdAt: savedMessage.createdAt,
                                senderName: sender.userName,
                                chatId: chat.id,
                            },
                        };
                        this.clients.forEach((client) => {
                            if (client.chatId === chat.id &&
                                client.ws.readyState === ws.OPEN) {
                                client.ws.send(JSON.stringify(messageToSend));
                            }
                        });
                    }
                }
                catch (error) {
                    console.error("Error procesando mensaje:", error);
                }
            }));
            ws.on("close", () => {
                console.log("Cliente desconectado");
                this.clients.delete(ws);
            });
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dbConnect();
            this.setupWebSocket();
            this.server.listen(this.port, () => {
                console.log(`Servidor en http://localhost:${this.port}`);
            });
        });
    }
}
exports.ServerBootstrap = ServerBootstrap;
