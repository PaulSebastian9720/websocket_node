import { AppDataSource } from "../config/data.source";
import { GroupMessage } from "../entities/groupMessages"; 
import { Group } from "../entities/groupChat"; 
import { User } from "../entities/user";
import { MessageStatus } from "../other/MessageStatus";

export class GroupMessageService {
  private groupMessageRepo = AppDataSource.getRepository(GroupMessage);

  async createMessage(content: string, group: Group, sender: User): Promise<GroupMessage> {
    const message = this.groupMessageRepo.create({
      content,
      group,
      sender,
      status: MessageStatus.SENT,
    });
    return await this.groupMessageRepo.save(message);
  }

  async getMessagesByGroup(groupId: number): Promise<GroupMessage[]> {
    return await this.groupMessageRepo.find({
      where: { group: { id: groupId } },
      relations: ["sender"],
      order: { createdAt: "ASC" },
    });
  }
}
