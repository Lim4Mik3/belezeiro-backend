/**
 * Plan Repository Contract
 */
export interface IPlanRepository {
  create(plan: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  update(plan: any): Promise<void>;
  delete(id: string): Promise<void>;
}
