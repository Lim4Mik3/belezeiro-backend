import { UserEntity } from "@iam/domain/entities/user-entity";

/**
 * User Repository Contract
 * Consolidated from IAM module
 */
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByProviderId(providerId: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<boolean>;
}
