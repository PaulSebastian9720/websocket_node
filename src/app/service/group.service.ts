import { AppDataSource } from "../config/data.source";
import { Group } from "../entities/groupChat"; 
import { User } from "../entities/user";

export class GroupService {
  private groupRepo = AppDataSource.getRepository(Group);

  async createGroup(name: string, users: User[]): Promise<Group> {
    const group = this.groupRepo.create({ name, users });
    return await this.groupRepo.save(group);
  }

  async addUserToGroup(groupId: number, user: User): Promise<Group | null> {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ["users"] });
    if (!group) return null;

    group.users.push(user);
    return await this.groupRepo.save(group);
  }

  async removeUserFromGroup(groupId: number, userId: number): Promise<Group | null> {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ["users"] });
    if (!group) return null;

    group.users = group.users.filter(u => u.id !== userId);
    return await this.groupRepo.save(group);
  }

  async findById(id: number): Promise<Group | null> {
    return await this.groupRepo.findOne({ where: { id }, relations: ["users"] });
  }
}
