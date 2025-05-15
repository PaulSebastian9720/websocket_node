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
exports.ChatService = void 0;
const data_source_1 = require("../config/data.source");
const chat_1 = require("../entities/chat");
class ChatService {
    constructor() {
        this.chatRepo = data_source_1.AppDataSource.getRepository(chat_1.Chat);
    }
    getOrCreateChat(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            let chat = yield this.chatRepo.findOne({
                where: [
                    { user1: user1, user2: user2 },
                    { user1: user2, user2: user1 },
                ],
                relations: ["user1", "user2"],
            });
            if (!chat) {
                chat = this.chatRepo.create({ user1, user2 });
                yield this.chatRepo.save(chat);
            }
            return chat;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatRepo.findOne({
                where: { id },
                relations: ["user1", "user2"],
            });
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatRepo.findOneBy({ id });
        });
    }
}
exports.ChatService = ChatService;
