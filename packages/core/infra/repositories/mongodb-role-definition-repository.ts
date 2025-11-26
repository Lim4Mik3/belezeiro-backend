import { Collection } from 'mongodb';
import { mongoDBClient } from '../clients/mongodb-client';
import { IRoleDefinitionRepository, ROLE_SCOPE_GLOBAL } from '../../app/contracts/repositories/i-role-definition-repository';
import { RoleDefinitionEntity } from '@iam/domain/entities/role-definition-entity';

export type RoleDefinitionDocument = {
  _id: string;
  name: string;
  scope: string;
  description: string;
  permissions: string[];
  created_by: string | null;
  business_id: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class MongoDBRoleDefinitionRepository
  implements IRoleDefinitionRepository
{
  constructor() {
    this.setupIndexes();
  }

  private toDocument(roleDefinition: RoleDefinitionEntity): RoleDefinitionDocument {
    return {
      _id: roleDefinition.id,
      name: roleDefinition.name,
      scope: roleDefinition.scope,
      description: roleDefinition.description,
      permissions: roleDefinition.permissions.toArray(),
      created_by: roleDefinition.created_by,
      business_id: roleDefinition.business_id,
      createdAt: roleDefinition.createdAt,
      updatedAt: roleDefinition.updatedAt,
    };
  }

  private toEntity(doc: RoleDefinitionDocument): RoleDefinitionEntity {
    return new RoleDefinitionEntity({
      id: doc._id,
      name: doc.name,
      scope: doc.scope as any,
      description: doc.description,
      permissions: doc.permissions,
      created_by: doc.created_by,
      business_id: doc.business_id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private getCollection(): Collection<RoleDefinitionDocument> {
    return mongoDBClient
      .getDatabase()
      .collection<RoleDefinitionDocument>('role_definitions');
  }

  private async setupIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.createIndex({ _id: 1 });
      await collection.createIndex({ name: 1, business_id: 1 }, { unique: true });
      await collection.createIndex({ scope: 1 });
      await collection.createIndex({ business_id: 1 });
      await collection.createIndex({ created_by: 1 });
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error(
        '[MongoDBRoleDefinitionRepository] Failed to create indexes:',
        error,
      );
    }
  }

  async create(roleDefinition: any): Promise<void> {
    try {
      const doc = this.toDocument(roleDefinition);
      await this.getCollection().insertOne(doc);
    } catch (error) {
      console.error(
        '[MongoDBRoleDefinitionRepository] Failed to create role definition:',
        error,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findManyByIds(ids: string[]): Promise<any[]> {
    if (ids.length === 0) {
      return [];
    }

    const docs = await this.getCollection()
      .find({ _id: { $in: ids } })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByName(
    name: string,
    businessId?: string,
  ): Promise<any | null> {
    const query: any = {
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    };

    if (businessId !== undefined) {
      query.business_id = businessId;
    } else {
      query.business_id = null;
    }

    const doc = await this.getCollection().findOne(query);

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findGlobalRoleByName(name: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({
      scope: ROLE_SCOPE_GLOBAL,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findAll(): Promise<any[]> {
    const docs = await this.getCollection()
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    const docs = await this.getCollection()
      .find({ business_id: businessId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findGlobal(): Promise<any[]> {
    const docs = await this.getCollection()
      .find({ scope: ROLE_SCOPE_GLOBAL })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async update(roleDefinition: any): Promise<void> {
    try {
      const doc = this.toDocument(roleDefinition);
      await this.getCollection().updateOne(
        { _id: roleDefinition.id },
        { $set: doc },
      );
    } catch (error) {
      console.error(
        '[MongoDBRoleDefinitionRepository] Failed to update role definition:',
        error,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getCollection().deleteOne({ _id: id });
    } catch (error) {
      console.error(
        '[MongoDBRoleDefinitionRepository] Failed to delete role definition:',
        error,
      );
      throw error;
    }
  }
}
