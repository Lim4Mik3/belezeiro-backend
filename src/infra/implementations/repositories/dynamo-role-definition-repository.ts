import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { IRoleDefinitionRepository } from "@core/contracts/repositories/i-role-definition-repository";
import { dynamoDBClient } from "@infra/clients/dynamodb-client";

export class DynamoRoleDefinitionRepository implements IRoleDefinitionRepository {
  private client: DynamoDBDocumentClient;

  private tableName() {
    return `belezeiro-${process.env.STAGE}-main`;
  }

  constructor() {
    this.client = dynamoDBClient;
  }

  async create(roleDefinition: any): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName(),
      Item: {
        PK: `ROLE_DEF#${roleDefinition.id}`,
        SK: "ROOT",
        id: roleDefinition.id,
        name: roleDefinition.name,
        scope: roleDefinition.scope,
        permissions: roleDefinition.permissions,
        businessId: roleDefinition.businessId,
        createdAt: roleDefinition.createdAt.toISOString(),
        updatedAt: roleDefinition.updatedAt.toISOString(),
      },
    });

    await this.client.send(command);
  }

  async findById(id: string): Promise<any | null> {
    const command = new GetCommand({
      TableName: this.tableName(),
      Key: {
        PK: `ROLE_DEF#${id}`,
        SK: "ROOT",
      },
    });

    const result = await this.client.send(command);

    if (!result.Item) {
      return null;
    }

    return result.Item;
  }

  async findManyByIds(ids: string[]): Promise<any[]> {
    const keys = ids.map(id => ({
      PK: `ROLE_DEF#${id}`,
      SK: "ROOT",
    }));

    const command = new BatchGetCommand({
      RequestItems: {
        [this.tableName()]: {
          Keys: keys,
        },
      },
    });

    const result = await this.client.send(command);

    return result.Responses?.[this.tableName()] || [];
  }

  async findByName(name: string, businessId?: string): Promise<any | null> {
    const roles = businessId
      ? await this.findByBusinessId(businessId)
      : await this.findAll();

    return roles.find(role => role.name === name) || null;
  }

  async findGlobalRoleByName(name: string): Promise<any | null> {
    const roles = await this.findGlobal();
    return roles.find(role => role.name === name) || null;
  }

  async findAll(): Promise<any[]> {
    const command = new ScanCommand({
      TableName: this.tableName(),
      FilterExpression: "begins_with(PK, :pk) AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": "ROLE_DEF#",
        ":sk": "ROOT",
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    const command = new ScanCommand({
      TableName: this.tableName(),
      FilterExpression: "begins_with(PK, :pk) AND SK = :sk AND businessId = :businessId",
      ExpressionAttributeValues: {
        ":pk": "ROLE_DEF#",
        ":sk": "ROOT",
        ":businessId": businessId,
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async findGlobal(): Promise<any[]> {
    const command = new ScanCommand({
      TableName: this.tableName(),
      FilterExpression: "begins_with(PK, :pk) AND SK = :sk AND #scope = :scope",
      ExpressionAttributeNames: {
        "#scope": "scope",
      },
      ExpressionAttributeValues: {
        ":pk": "ROLE_DEF#",
        ":sk": "ROOT",
        ":scope": "GLOBAL",
      },
    });

    const result = await this.client.send(command);

    return result.Items || [];
  }

  async update(roleDefinition: any): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName(),
      Key: {
        PK: `ROLE_DEF#${roleDefinition.id}`,
        SK: "ROOT",
      },
      UpdateExpression: "SET #name = :name, #permissions = :permissions, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#permissions": "permissions",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": roleDefinition.name,
        ":permissions": roleDefinition.permissions,
        ":updatedAt": new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName(),
      Key: {
        PK: `ROLE_DEF#${id}`,
        SK: "ROOT",
      },
    });

    await this.client.send(command);
  }
}
