import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IUserRepository } from "@core/contracts/repositories/i-user-repository";
import { UserEntity } from "@iam/domain/entities/user-entity";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoUserRepository implements IUserRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  private toDomain(user: any): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      photo_url: user.photo_url,
      provider_id: user.provider_id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const command = new GetCommand({
      TableName: this.tableName(),
      Key: {
        PK: `USER#${id}`,
        SK: "ROOT",
      },
    });

    const result = await this.client.send(command)

    if (!result.Item) {
      return null;
    }

    const user = result.Item;

    return this.toDomain(user);
  }

  async findByProviderId(providerId: string): Promise<UserEntity | null> {
    const command = new QueryCommand({
      TableName: this.tableName(),
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1_PK = :pk",
      ExpressionAttributeValues: {
        ":pk": providerId,
      },
    });

    const result = await this.client.send(command)

    if (!result.Items || result.Items.length < 1) {
      return null;
    }

    const user = result.Items[0];

    return this.toDomain(user);
  }

  async create(user: UserEntity): Promise<boolean> {
    try {
      const command = new PutCommand({
        TableName: this.tableName(),
        Item: {
          PK: `USER#${user.id}`,
          SK: "ROOT",
          id: user.id,
          name: user.name,
          email: user.email,
          photo_url: user.photo_url,
          provider_id: user.provider_id,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });

      await this.client.send(command);

      return true;
    } catch (err) {
      console.error("Erro ao salvar usuário no DynamoDB:", err);
      return false;
    }
  }
}
