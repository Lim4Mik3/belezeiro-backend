import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

class DynamoDBClientSingleton {
  private static instance: DynamoDBDocumentClient;

  private constructor() { }

  public static getInstance(): DynamoDBDocumentClient {
    if (!DynamoDBClientSingleton.instance) {
      const client = new DynamoDBClient({
        region: 'us-east-2'
      });

      DynamoDBClientSingleton.instance = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      });
    }

    return DynamoDBClientSingleton.instance;
  }
}

export const dynamoDBClient = DynamoDBClientSingleton.getInstance();
