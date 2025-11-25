import { UnitEntity } from "@business/domain/entities/unit-entity";

export interface IUnitRepository {
  create(unit: UnitEntity): Promise<void>;
  findById(id: string): Promise<UnitEntity | null>;
  findByBusinessId(businessId: string): Promise<UnitEntity[]>;
  update(unit: UnitEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
