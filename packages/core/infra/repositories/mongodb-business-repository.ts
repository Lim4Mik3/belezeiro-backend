import { Collection } from "mongodb";
import { mongoDBClient } from "../clients/mongodb-client";
import { IBusinessRepository } from "../../app/contracts/repositories/i-business-repository";
import { IUnitRepository } from "../../app/contracts/repositories/i-unit-repository";
import { BusinessEntity } from "@business/domain/entities/business-entity";
import { UnitEntity } from "@business/domain/entities/unit-entity";

export type BusinessDocument = {
  _id: string;
  name: string;
  units: string[];
  createdAt: Date;
  updatedAt: Date;
};

export class MongoDBBusinessRepository implements IBusinessRepository {
  constructor(private unitRepository: IUnitRepository) {
    this.setupIndexes();
  }

  private toDocument(business: BusinessEntity): BusinessDocument {
    return {
      _id: business.id,
      name: business.name,
      units: business.units.map((u) => u.id),
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    };
  }

  private toEntity(doc: BusinessDocument, units: UnitEntity[]): BusinessEntity {
    return new BusinessEntity({
      id: doc._id,
      name: doc.name,
      units: units,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdByUserId: "", // This will be ignored since we're reconstructing
    });
  }

  private getCollection(): Collection<BusinessDocument> {
    return mongoDBClient.getDatabase().collection<BusinessDocument>("businesses");
  }

  private async setupIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.createIndex({ _id: 1 });
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error("[MongoDBBusinessRepository] Failed to create indexes:", error);
    }
  }

  async create(business: any): Promise<void> {
    // 1. Criar o documento do business
    const doc = this.toDocument(business);
    await this.getCollection().insertOne(doc);

    // 2. Criar todas as units do agregado
    for (const unit of business.units) {
      await this.unitRepository.create(unit);
    }
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.getCollection().findOne({ _id: id });

    if (!doc) {
      return null;
    }

    // Carregar o agregado completo com suas units
    const units = await this.unitRepository.findByBusinessId(doc._id);
    return this.toEntity(doc, units);
  }

  async update(business: any): Promise<void> {
    const doc = this.toDocument(business);

    // 1. Atualizar o documento do business
    await this.getCollection().updateOne(
      { _id: business.id },
      {
        $set: {
          name: doc.name,
          units: doc.units,
          updatedAt: doc.updatedAt,
        },
      }
    );

    // 2. Buscar units existentes no banco
    const existingUnits = await this.unitRepository.findByBusinessId(business.id);
    const existingUnitIds = new Set(existingUnits.map((u: any) => u.id));
    const newUnitIds = new Set(business.units.map((u: any) => u.id));

    // 3. Deletar units que foram removidas do agregado
    for (const existingUnit of existingUnits) {
      if (!newUnitIds.has(existingUnit.id)) {
        await this.unitRepository.delete(existingUnit.id);
      }
    }

    // 4. Criar ou atualizar units do agregado
    for (const unit of business.units) {
      if (existingUnitIds.has(unit.id)) {
        // Unit já existe, atualizar
        await this.unitRepository.update(unit);
      } else {
        // Unit nova, criar
        await this.unitRepository.create(unit);
      }
    }
  }

  async delete(id: string): Promise<void> {
    // 1. Deletar todas as units do business
    const units = await this.unitRepository.findByBusinessId(id);
    for (const unit of units) {
      await this.unitRepository.delete(unit.id);
    }

    // 2. Deletar o business
    await this.getCollection().deleteOne({ _id: id });
  }
}
