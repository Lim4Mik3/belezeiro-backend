import { BusinessEntity } from "@business/domain/entities/business-entity";

export interface IBusinessRepository {
  create(business: BusinessEntity): Promise<void>;
  findById(id: string): Promise<BusinessEntity | null>;
  update(business: BusinessEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
