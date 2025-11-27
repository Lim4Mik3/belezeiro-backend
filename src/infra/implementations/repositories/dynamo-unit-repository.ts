import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { IUnitRepository } from "@core/contracts/repositories/i-unit-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoUnitRepository implements IUnitRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(unit: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `BUSINESS#${unit.business_id}`,
        SK: `UNIT#${unit.id}`,
        id: unit.id,
        business_id: unit.business_id,
        name: unit.name,
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    // Note: This requires knowing the business_id
    throw new Error("findById not supported for Unit - use findByBusinessId and filter by id");
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    const command = new QueryCommand({
      TableName: this.tableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `BUSINESS#${businessId}`,
        ":sk": "UNIT#",
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async update(unit: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${unit.business_id}`,
        SK: `UNIT#${unit.id}`,
      },
      UpdateExpression: "SET #name = :name, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": unit.name,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    // Note: This requires knowing the business_id
    throw new Error("delete not supported for Unit without business_id - provide composite key");
  }
}
