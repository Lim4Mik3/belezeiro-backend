/**
 * Subscription Repository Contract
 */
export interface ISubscriptionRepository {
  create(subscription: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByUnitId(unitId: string): Promise<any[]>;
  update(subscription: any): Promise<void>;
  delete(id: string): Promise<void>;
}
