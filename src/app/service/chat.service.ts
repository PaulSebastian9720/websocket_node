import { AppDataSource } from "../config/data.source";
import { Chat } from "../entities/chat";
import { User } from "../entities/user";

export class ChatService {
  private chatRepo = AppDataSource.getRepository(Chat);

  async getOrCreateChat(user1: User, user2: User): Promise<Chat> {
    let chat = await this.chatRepo.findOne({
      where: [
        { user1: user1, user2: user2 },
        { user1: user2, user2: user1 },
      ],
      relations: ["user1", "user2"],
    });

    if (!chat) {
      chat = this.chatRepo.create({ user1, user2 });
      await this.chatRepo.save(chat);
    }

    return chat;
  }

  async findById(id: number): Promise<Chat | null> {
    return await this.chatRepo.findOne({
      where: { id },
      relations: ["user1", "user2"],
    });
  }

  async findOne(id: number): Promise<Chat | null> {
    return await this.chatRepo.findOneBy({ id });
  }
}
