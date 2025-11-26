import { IBusinessRepository } from "../../app/contracts/repositories/i-business-repository";

export class InMemoryBusinessRepository implements IBusinessRepository {
  private businesses: Map<string, any> = new Map();

  async create(business: any): Promise<void> {
    this.businesses.set(business.id, business);
  }

  async findById(id: string): Promise<any | null> {
    return this.businesses.get(id) || null;
  }

  async update(business: any): Promise<void> {
    this.businesses.set(business.id, business);
  }

  async delete(id: string): Promise<void> {
    this.businesses.delete(id);
  }
}
