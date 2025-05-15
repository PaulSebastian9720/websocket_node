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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const data_source_1 = require("../config/data.source");
const message_1 = require("../entities/message");
const MessageStatus_1 = require("../other/MessageStatus");
class MessageService {
    constructor() {
        this.messageRepo = data_source_1.AppDataSource.getRepository(message_1.Message);
    }
    createMessage(content, chat, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.messageRepo.create({
                content,
                chat,
                sender,
                status: MessageStatus_1.MessageStatus.SENT,
            });
            return yield this.messageRepo.save(message);
        });
    }
    getMessagesByChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageRepo.find({
                where: { chat: { id: chatId } },
                relations: ["sender"],
                order: { createdAt: "ASC" },
            });
        });
    }
}
exports.MessageService = MessageService;
