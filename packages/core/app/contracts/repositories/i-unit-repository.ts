/**
 * Unit Repository Contract
 * Moved from Business module
 */
export interface IUnitRepository {
  create(unit: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByBusinessId(businessId: string): Promise<any[]>;
  update(unit: any): Promise<void>;
  delete(id: string): Promise<void>;
}
