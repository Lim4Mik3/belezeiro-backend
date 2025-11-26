import { Collection } from "mongodb";
import { mongoDBClient } from "../clients/mongodb-client";
import { IUnitRepository } from "../../app/contracts/repositories/i-unit-repository";
import { UnitEntity } from "@business/domain/entities/unit-entity";

export type UnitDocument = {
  _id: string;
  name: string;
  business_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export class MongoDBUnitRepository implements IUnitRepository {
  constructor() {
    this.setupIndexes();
  }

  private toDocument(unit: UnitEntity): UnitDocument {
    return {
      _id: unit.id,
      name: unit.name,
      business_id: unit.businessId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }

  private toEntity(doc: UnitDocument): UnitEntity {
    return new UnitEntity({
      id: doc._id,
      name: doc.name,
      business_id: doc.business_id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private getCollection(): Collection<UnitDocument> {
    return mongoDBClient.getDatabase().collection<UnitDocument>("units");
  }

  private async setupIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.createIndex({ _id: 1 });
      await collection.createIndex({ business_id: 1 });
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error("[MongoDBUnitRepository] Failed to create indexes:", error);
    }
  }

  async create(unit: any): Promise<void> {
    const doc = this.toDocument(unit);
    await this.getCollection().insertOne(doc);
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    const docs = await this.getCollection()
      .find({ business_id: businessId })
      .toArray();

    return docs.map((doc) => this.toEntity(doc));
  }

  async update(unit: any): Promise<void> {
    const doc = this.toDocument(unit);

    await this.getCollection().updateOne(
      { _id: unit.id },
      {
        $set: {
          name: doc.name,
          business_id: doc.business_id,
          updatedAt: doc.updatedAt,
        },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.getCollection().deleteOne({ _id: id });
  }
}
