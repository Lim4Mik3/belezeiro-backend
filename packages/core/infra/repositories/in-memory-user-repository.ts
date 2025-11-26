import { IUserRepository } from "../../app/contracts/repositories/i-user-repository";

type UserLike = {
  id: string;
  provider_id: string;
  [key: string]: any;
};

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, any> = new Map();

  async create(user: any): Promise<boolean> {
    this.users.set(user.id, user);
    return true;
  }

  async findUserByProviderID(provider_id: string): Promise<any | null> {
    for (const user of this.users.values()) {
      if (user.provider_id === provider_id) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<any | null> {
    return this.users.get(id) || null;
  }

  async update(user: any): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
