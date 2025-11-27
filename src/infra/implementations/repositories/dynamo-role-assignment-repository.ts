import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { IRoleAssignmentRepository } from "@core/contracts/repositories/i-role-assignment-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoRoleAssignmentRepository implements IRoleAssignmentRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(assignment: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `USER#${assignment.user_id}`,
        SK: `ROLE#${assignment.role_key}#${assignment.target_key}#${assignment.target_id}`,
        GSI2_PK: `TARGET#${assignment.target_key}#${assignment.target_id}`,
        GSI2_SK: `ROLE#${assignment.role_key}#USER#${assignment.user_id}`,
        id: assignment.id,
        user_id: assignment.user_id,
        role_key: assignment.role_key,
        target_key: assignment.target_key,
        target_id: assignment.target_id,
        createdAt: assignment.createdAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    // Note: DynamoDB doesn't support direct findById for this structure
    // This would require scanning or maintaining a GSI with id as key
    throw new Error("findById not supported for RoleAssignment - use findByUserId instead");
  }

  async findByUserId(userId: string): Promise<any[]> {
    const command = new QueryCommand({
      TableName: this.tableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "ROLE#",
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async findByUserIdAndRoleId(userId: string, roleId: string): Promise<any | null> {
    const items = await this.findByUserId(userId);
    return items.find((item) => item.role_key === roleId) || null;
  }

  async findByUserIdAndTargetId(userId: string, targetId: string | null): Promise<any[]> {
    const items = await this.findByUserId(userId);
    if (!targetId) {
      return items;
    }
    return items.filter((item) => item.target_id === targetId);
  }

  async findActiveByUserId(userId: string): Promise<any[]> {
    return this.findByUserId(userId);
  }

  async findAll(): Promise<any[]> {
    // This requires a scan, which is expensive
    throw new Error("findAll not recommended for RoleAssignment - use specific queries");
  }

  async update(assignment: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `USER#${assignment.user_id}`,
        SK: `ROLE#${assignment.role_key}#${assignment.target_key}#${assignment.target_id}`,
        GSI2_PK: `TARGET#${assignment.target_key}#${assignment.target_id}`,
        GSI2_SK: `ROLE#${assignment.role_key}#USER#${assignment.user_id}`,
        id: assignment.id,
        user_id: assignment.user_id,
        role_key: assignment.role_key,
        target_key: assignment.target_key,
        target_id: assignment.target_id,
        createdAt: assignment.createdAt,
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    throw new Error("delete by id not supported for RoleAssignment - use deleteByUserId");
  }

  async deleteByUserId(userId: string): Promise<void> {
    const items = await this.findByUserId(userId);

    for (const item of items) {
      const command = new DeleteCommand({
        TableName: this.tableName(),
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      });

      await this.client.send(command);
    }
  }
}
