import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ISubscriptionRepository } from "@core/contracts/repositories/i-subscription-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoSubscriptionRepository implements ISubscriptionRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(subscription: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `BUSINESS#${subscription.business_id}`,
        SK: `UNIT#${subscription.unit_id}#SUBSCRIPTION#${subscription.id}`,
        id: subscription.id,
        unit_id: subscription.unit_id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    // Note: This requires knowing the business_id and unit_id
    throw new Error("findById not supported for Subscription - use findByUnitId and filter by id");
  }

  async findByUnitId(unitId: string): Promise<any[]> {
    // Note: This requires knowing the business_id
    throw new Error("findByUnitId requires business_id - provide composite key");
  }

  async update(subscription: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${subscription.business_id}`,
        SK: `UNIT#${subscription.unit_id}#SUBSCRIPTION#${subscription.id}`,
      },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":status": subscription.status,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    // Note: This requires knowing the business_id and unit_id
    throw new Error("delete not supported for Subscription without business_id and unit_id - provide composite key");
  }
}
