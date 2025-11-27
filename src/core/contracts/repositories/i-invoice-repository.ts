/**
 * Invoice Repository Contract
 */
export interface IInvoiceRepository {
  create(invoice: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findBySubscriptionId(subscriptionId: string): Promise<any[]>;
  update(invoice: any): Promise<void>;
  delete(id: string): Promise<void>;
}
