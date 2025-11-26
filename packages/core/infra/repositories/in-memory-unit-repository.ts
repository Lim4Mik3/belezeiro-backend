import { IUnitRepository } from "../../app/contracts/repositories/i-unit-repository";

export class InMemoryUnitRepository implements IUnitRepository {
  private units: Map<string, any> = new Map();

  async create(unit: any): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async findById(id: string): Promise<any | null> {
    return this.units.get(id) || null;
  }

  async update(unit: any): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async delete(id: string): Promise<void> {
    this.units.delete(id);
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    return Array.from(this.units.values()).filter(
      (unit) => unit.businessId === businessId
    );
  }
}
