import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { IPlanRepository } from "@core/contracts/repositories/i-plan-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoPlanRepository implements IPlanRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(plan: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `PLAN#${plan.id}`,
        SK: "ROOT",
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: plan.features,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    const command = new GetCommand({
      TableName: this.tableName(),
      Key: {
        PK: `PLAN#${id}`,
        SK: "ROOT",
      },
    });

    const result = await this.client.send(command);

    if (!result.Item) {
      return null;
    }

    return result.Item;
  }

  async findAll(): Promise<any[]> {
    const command = new ScanCommand({
      TableName: this.tableName(),
      FilterExpression: "begins_with(PK, :pk) AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": "PLAN#",
        ":sk": "ROOT",
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async update(plan: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `PLAN#${plan.id}`,
        SK: "ROOT",
      },
      UpdateExpression: "SET #name = :name, #price = :price, #features = :features, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#price": "price",
        "#features": "features",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": plan.name,
        ":price": plan.price,
        ":features": plan.features,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName(),
      Key: {
        PK: `PLAN#${id}`,
        SK: "ROOT",
      },
    });

    await this.client.send(command);
  }
}
