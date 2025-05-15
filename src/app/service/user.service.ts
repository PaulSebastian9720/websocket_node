import { AppDataSource } from "../config/data.source";
import { User } from "../entities/user";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async findOrCreate(userName: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { userName } });
    if (!user) {
      user = this.userRepo.create({ userName });
      await this.userRepo.save(user);
    }
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }
}
