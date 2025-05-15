import { AppDataSource } from "../config/data.source";
import { Message } from "../entities/message";
import { Chat } from "../entities/chat";
import { User } from "../entities/user";
import { MessageStatus } from "../other/MessageStatus";

export class MessageService {
  private messageRepo = AppDataSource.getRepository(Message);

  async createMessage(content: string, chat: Chat, sender: User): Promise<Message> {
    const message = this.messageRepo.create({
      content,
      chat,
      sender,
      status: MessageStatus.SENT,
    });
    return await this.messageRepo.save(message);
  }

  async getMessagesByChat(chatId: number): Promise<Message[]> {
    return await this.messageRepo.find({
      where: { chat: { id: chatId } },
      relations: ["sender"],
      order: { createdAt: "ASC" },
    });
  }
}
