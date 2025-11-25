import { IUserRepository } from "@iam/app/contracts/repositories/i-user-repository";
import { UserEntity } from "@iam/domain/entities/user-entity";

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async create(user: UserEntity): Promise<void> {
    this.users.set(user.id, user);
  }

  async findUserByProviderID(provider_id: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.provider_id === provider_id) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async update(user: UserEntity): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
