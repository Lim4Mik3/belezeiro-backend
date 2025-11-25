import { IEventBus } from "@core/bus/i-event-bus";
import { RedisEventBus } from "@core/infra/clients/redis-event-bus";
import { redisClient } from "@core/infra/clients/redis-client";
// import { SQSEventBus } from "@core/infra/clients/sqs-event-bus";
// import { EventBridgeEventBus } from "@core/infra/clients/eventbridge-event-bus";
// import { CompositeEventBus } from "@core/infra/clients/composite-event-bus";

let eventBusInstance: IEventBus | null = null;

/**
 * Factory para criar a instância do Event Bus (Singleton)
 *
 * Configura o event bus apropriado baseado no ambiente:
 * - Development: Redis local
 * - Staging: Redis + SQS
 * - Production: EventBridge + Redis (cache)
 */
export function makeEventBus(): IEventBus {
  if (eventBusInstance) {
    return eventBusInstance;
  }

  const environment = process.env.NODE_ENV || "development";

  switch (environment) {
    case "development":
    case "test":
      eventBusInstance = makeRedisEventBus();
      break;

    case "staging":
      // TODO: Implementar quando tiver SQS configurado
      // eventBusInstance = new CompositeEventBus([
      //   makeRedisEventBus(),
      //   makeSQSEventBus()
      // ]);
      eventBusInstance = makeRedisEventBus();
      break;

    case "production":
      // TODO: Implementar quando tiver EventBridge configurado
      // eventBusInstance = new CompositeEventBus([
      //   makeEventBridgeEventBus(),
      //   makeRedisEventBus() // Para cache
      // ]);
      eventBusInstance = makeRedisEventBus();
      break;

    default:
      throw new Error(`Unknown environment: ${environment}`);
  }

  return eventBusInstance;
}

/**
 * Cria Redis Event Bus usando o singleton do RedisClient
 */
function makeRedisEventBus(): RedisEventBus {
  return new RedisEventBus(redisClient);
}

/**
 * Cria SQS Event Bus
 * Descomentar quando configurar AWS SDK
 */
// function makeSQSEventBus(): SQSEventBus {
//   const { SQSClient } = require("@aws-sdk/client-sqs");
//
//   const client = new SQSClient({
//     region: process.env.AWS_REGION || "us-east-1",
//   });
//
//   const queueUrl = process.env.SQS_QUEUE_URL;
//   if (!queueUrl) {
//     throw new Error("SQS_QUEUE_URL environment variable is required");
//   }
//
//   const isFifo = queueUrl.endsWith(".fifo");
//
//   return new SQSEventBus(client, queueUrl, isFifo);
// }

/**
 * Cria EventBridge Event Bus
 * Descomentar quando configurar AWS SDK
 */
// function makeEventBridgeEventBus(): EventBridgeEventBus {
//   const { EventBridgeClient } = require("@aws-sdk/client-eventbridge");
//
//   const client = new EventBridgeClient({
//     region: process.env.AWS_REGION || "us-east-1",
//   });
//
//   const eventBusName = process.env.EVENTBRIDGE_BUS_NAME || "default";
//
//   return new EventBridgeEventBus(client, eventBusName);
// }
