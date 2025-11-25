import { IUnitRepository } from "@business/app/contracts/repositories/i-unit-repository";
import { UnitEntity } from "@business/domain/entities/unit-entity";

export class InMemoryUnitRepository implements IUnitRepository {
  private units: Map<string, UnitEntity> = new Map();

  async create(unit: UnitEntity): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async findById(id: string): Promise<UnitEntity | null> {
    return this.units.get(id) || null;
  }

  async update(unit: UnitEntity): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async delete(id: string): Promise<void> {
    this.units.delete(id);
  }

  async findByBusinessId(businessId: string): Promise<UnitEntity[]> {
    return Array.from(this.units.values()).filter(
      (unit) => unit.business_id === businessId
    );
  }
}
