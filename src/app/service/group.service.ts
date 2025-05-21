import { AppDataSource } from "../config/data.source";
import { Group } from "../entities/groupChat";
import { User } from "../entities/user";

export class GroupService {
  private groupRepo = AppDataSource.getRepository(Group);

  async findOrCreate(groupId: number, groupName: string): Promise<Group> {
    let group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group) {
      group = this.groupRepo.create({ id: groupId, name: groupName });
      group = await this.groupRepo.save(group);
    }
    return group;
  }
}
