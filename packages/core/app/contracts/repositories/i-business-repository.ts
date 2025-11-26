/**
 * Business Repository Contract
 * Moved from Business module
 */
export interface IBusinessRepository {
  create(business: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  update(business: any): Promise<void>;
  delete(id: string): Promise<void>;
}
