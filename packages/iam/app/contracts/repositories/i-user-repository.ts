import { UserEntity } from "@iam/domain/entities/user-entity";

export interface IUserRepository {
  findUserByProviderID(provider_id: string): Promise<UserEntity>;
  create(user: UserEntity): Promise<boolean>;
}