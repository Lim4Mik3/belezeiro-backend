import { Collection } from 'mongodb';
import { mongoDBClient } from '../clients/mongodb-client';
import { IRoleAssignmentRepository } from '../../app/contracts/repositories/i-role-assignment-repository';
import { RoleAssignmentEntity } from '@iam/domain/entities/role-assignment-entity';

export type RoleAssignmentDocument = {
  _id: string;
  userId: string;
  roleId: string;
  targetId: string | null;
  assignedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class MongoDBRoleAssignmentRepository implements IRoleAssignmentRepository {
  constructor() {
    this.setupIndexes();
  }

  private toDocument(assignment: RoleAssignmentEntity): RoleAssignmentDocument {
    return {
      _id: assignment.id,
      userId: assignment.userId,
      roleId: assignment.roleId,
      targetId: assignment.targetId,
      assignedAt: assignment.assignedAt,
      expiresAt: assignment.expiresAt,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };
  }

  private toEntity(doc: RoleAssignmentDocument): RoleAssignmentEntity {
    return new RoleAssignmentEntity({
      id: doc._id,
      userId: doc.userId,
      roleId: doc.roleId,
      targetId: doc.targetId,
      assignedAt: doc.assignedAt,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private getCollection(): Collection<RoleAssignmentDocument> {
    return mongoDBClient
      .getDatabase()
      .collection<RoleAssignmentDocument>('role_assignments');
  }

  private async setupIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.createIndex({ _id: 1 });
      await collection.createIndex({ userId: 1 });
      await collection.createIndex({ roleId: 1 });
      await collection.createIndex({ userId: 1, roleId: 1 });
      await collection.createIndex({ userId: 1, targetId: 1 });
      await collection.createIndex({ targetId: 1 });
      await collection.createIndex({ expiresAt: 1 });
      await collection.createIndex({ assignedAt: -1 });
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error(
        '[MongoDBRoleAssignmentRepository] Failed to create indexes:',
        error,
      );
    }
  }

  async create(assignment: any): Promise<void> {
    try {
      const doc = this.toDocument(assignment);
      await this.getCollection().insertOne(doc);
    } catch (error) {
      console.error(
        '[MongoDBRoleAssignmentRepository] Failed to create assignment:',
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

  async findByUserId(userId: string): Promise<any[]> {
    const docs = await this.getCollection()
      .find({ userId })
      .sort({ assignedAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByUserIdAndRoleId(
    userId: string,
    roleId: string,
  ): Promise<any | null> {
    const doc = await this.getCollection().findOne({ userId, roleId });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findByUserIdAndTargetId(
    userId: string,
    targetId: string | null,
  ): Promise<any[]> {
    const docs = await this.getCollection()
      .find({ userId, targetId })
      .sort({ assignedAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findActiveByUserId(userId: string): Promise<any[]> {
    const now = new Date();

    const docs = await this.getCollection()
      .find({
        userId,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      })
      .sort({ assignedAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findAll(): Promise<any[]> {
    const docs = await this.getCollection()
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async update(assignment: any): Promise<void> {
    try {
      const doc = this.toDocument(assignment);
      await this.getCollection().updateOne({ _id: assignment.id }, { $set: doc });
    } catch (error) {
      console.error(
        '[MongoDBRoleAssignmentRepository] Failed to update assignment:',
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
        '[MongoDBRoleAssignmentRepository] Failed to delete assignment:',
        error,
      );
      throw error;
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.getCollection().deleteMany({ userId });
    } catch (error) {
      console.error(
        '[MongoDBRoleAssignmentRepository] Failed to delete assignments by userId:',
        error,
      );
      throw error;
    }
  }
}
