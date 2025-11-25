import { IBusinessRepository } from "@business/app/contracts/repositories/i-business-repository";
import { BusinessEntity } from "@business/domain/entities/business-entity";

export class InMemoryBusinessRepository implements IBusinessRepository {
  private businesses: Map<string, BusinessEntity> = new Map();

  async create(business: BusinessEntity): Promise<void> {
    this.businesses.set(business.id, business);
  }

  async findById(id: string): Promise<BusinessEntity | null> {
    return this.businesses.get(id) || null;
  }

  async update(business: BusinessEntity): Promise<void> {
    this.businesses.set(business.id, business);
  }

  async delete(id: string): Promise<void> {
    this.businesses.delete(id);
  }

  async findByOwnerId(ownerId: string): Promise<BusinessEntity[]> {
    return Array.from(this.businesses.values()).filter(
      (business) => business.owner_id === ownerId
    );
  }
}
