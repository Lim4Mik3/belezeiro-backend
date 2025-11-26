/**
 * User Repository Contract
 * Consolidated from IAM module
 */
export interface IUserRepository {
  findById(id: string): Promise<any | null>;
  findUserByProviderID(provider_id: string): Promise<any | null>;
  create(user: any): Promise<boolean>;
}
