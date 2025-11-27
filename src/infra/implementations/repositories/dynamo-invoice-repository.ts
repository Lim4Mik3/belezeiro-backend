import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { IInvoiceRepository } from "@core/contracts/repositories/i-invoice-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoInvoiceRepository implements IInvoiceRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(invoice: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `BUSINESS#${invoice.business_id}`,
        SK: `UNIT#${invoice.unit_id}#SUBSCRIPTION#${invoice.subscription_id}#INVOICE#${invoice.id}`,
        id: invoice.id,
        subscription_id: invoice.subscription_id,
        unit_id: invoice.unit_id,
        amount: invoice.amount,
        status: invoice.status,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    // Note: This requires knowing the business_id, unit_id, and subscription_id
    throw new Error("findById not supported for Invoice - use findBySubscriptionId and filter by id");
  }

  async findBySubscriptionId(subscriptionId: string): Promise<any[]> {
    // Note: This requires knowing the business_id and unit_id
    throw new Error("findBySubscriptionId requires business_id and unit_id - provide composite key");
  }

  async update(invoice: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `BUSINESS#${invoice.business_id}`,
        SK: `UNIT#${invoice.unit_id}#SUBSCRIPTION#${invoice.subscription_id}#INVOICE#${invoice.id}`,
      },
      UpdateExpression: "SET #status = :status, #amount = :amount, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#amount": "amount",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":status": invoice.status,
        ":amount": invoice.amount,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    // Note: This requires knowing the business_id, unit_id, and subscription_id
    throw new Error("delete not supported for Invoice without business_id, unit_id, and subscription_id - provide composite key");
  }
}
