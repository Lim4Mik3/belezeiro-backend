import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { IBusinessRepository } from "@core/contracts/repositories/i-business-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoBusinessRepository implements IBusinessRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(business: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `BUSINESS#${business.id}`,
        SK: "ROOT",
        id: business.id,
        name: business.name,
        createdAt: business.createdAt.toISOString(),
        updatedAt: business.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    const command = new GetCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${id}`,
        SK: "ROOT",
      },
    });

    const result = await this.client.send(command);

    if (!result.Item) {
      return null;
    }

    return result.Item;
  }

  async update(business: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${business.id}`,
        SK: "ROOT",
      },
      UpdateExpression: "SET #name = :name, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": business.name,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${id}`,
        SK: "ROOT",
      },
    });

    await this.client.send(command);
  }
}
