import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IUserRepository } from "@core/contracts/repositories/i-user-repository";
import { UserEntity } from "@iam/domain/entities/user-entity";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

async function sendLog(logName: string, data: any) {
  try {
    await fetch('https://webhook-test.com/0267a3024903eb251119ef1afe8a7490', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: logName, data })
    });
  } catch (err) {
    console.error('Erro ao enviar log:', err);
  }
}

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

  private toPersistence(user: UserEntity) {
    return {
      PK: `USER#${user.id}`,
      SK: "ROOT",
      id: user.id,
      name: user.name,
      email: user.email.value,
      photo_url: user.photo_url.value,
      provider_id: user.provider_id,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      GSI1_PK: `USER#${user.provider_id}`,
      GSI1_SK: "ROOT"
    };
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
    await sendLog('repo-findByProviderId-start', { providerId, tableName: this.tableName() });

    const command = new QueryCommand({
      TableName: this.tableName(),
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1_PK = :pk AND GSI1_SK = :sk",
      ExpressionAttributeValues: {
        ":pk": `USER#${providerId}`,
        ":sk": "ROOT"
      },
    });

    const result = await this.client.send(command)

    if (!result.Items || result.Items.length < 1) {
      await sendLog('repo-findByProviderId-not-found', { providerId });
      return null;
    }

    const user = result.Items[0];

    await sendLog('repo-findByProviderId-found', { providerId, userId: user.id, email: user.email });

    return this.toDomain(user);
  }

  async create(user: UserEntity): Promise<boolean> {
    try {
      await sendLog('repo-create-start', {
        userId: user.id,
        email: user.email.value,
        provider_id: user.provider_id,
        tableName: this.tableName()
      });

      const command = new PutCommand({
        TableName: this.tableName(),
        Item: this.toPersistence(user),
      });

      await this.client.send(command);

      await sendLog('repo-create-success', { userId: user.id, email: user.email.value });

      return true;
    } catch (err) {
      console.error("Erro ao salvar usuário no DynamoDB:", err);

      await sendLog('repo-create-error', { userId: user.id, error: String(err) });

      throw new Error("Fail on create user");
    }
  }
}
