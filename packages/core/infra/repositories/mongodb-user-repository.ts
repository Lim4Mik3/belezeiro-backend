import { Collection } from "mongodb";
import { mongoDBClient } from "../clients/mongodb-client";
import { IUserRepository } from "../../app/contracts/repositories/i-user-repository";
import { UserEntity } from "@iam/domain/entities/user-entity";

export type UserDocument = {
  _id: string;
  provider_id: string;
  name: string;
  email: string;
  photo_url: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class MongoDBUserRepository implements IUserRepository {
  constructor() {
    this.setupIndexes();
  }

  private toDocument(user: UserEntity): UserDocument {
    return {
      _id: user.id,
      provider_id: user.provider_id,
      name: user.name,
      email: user.email.value,
      photo_url: user.photo_url.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toEntity(doc: UserDocument): UserEntity {
    return new UserEntity({
      id: doc._id,
      provider_id: doc.provider_id,
      name: doc.name,
      email: doc.email,
      photo_url: doc.photo_url,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private getCollection(): Collection<UserDocument> {
    return mongoDBClient.getDatabase().collection<UserDocument>("users");
  }

  private async setupIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.createIndex({ _id: 1 });
      await collection.createIndex({ provider_id: 1 }, { unique: true });
      await collection.createIndex({ email: 1 });
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error("[MongoDBUserRepository] Failed to create indexes:", error);
    }
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findUserByProviderID(provider_id: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({ provider_id });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async create(user: any): Promise<boolean> {
    try {
      const doc = this.toDocument(user);
      await this.getCollection().insertOne(doc);
      return true;
    } catch (error) {
      console.error("[MongoDBUserRepository] Failed to create user:", error);
      return false;
    }
  }
}
