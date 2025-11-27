import { IDomainEvent, IEventBus } from "@core/contracts/event-bus/i-event-bus";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { eventBridgeClient } from "@infra/clients/eventbridge-client";

export class EventBridgeEventBus implements IEventBus {
  private client: EventBridgeClient;
  private eventBusName: string;

  constructor() {
    this.client = eventBridgeClient;
    this.eventBusName = `belezeiro-${process.env.STAGE}-event-bus`;
  }

  async publish(event: IDomainEvent): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: this.eventBusName,
          Source: event.source,
          DetailType: event.type,
          Detail: JSON.stringify({
            id: event.id,
            type: event.type,
            version: event.version,
            correlationId: event.correlationId,
            causationId: event.causationId,
            timestamp: event.timestamp.toISOString(),
            source: event.source,
            data: event.data,
            metadata: event.metadata,
          }),
        },
      ],
    });

    const result = await this.client.send(command);

    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      throw new Error(`Failed to publish event: ${JSON.stringify(result.Entries)}`);
    }
  }

  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    // EventBridge supports up to 10 events per batch
    const batchSize = 10;
    const batches: IDomainEvent[][] = [];

    for (let i = 0; i < events.length; i += batchSize) {
      batches.push(events.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const command = new PutEventsCommand({
        Entries: batch.map((event) => ({
          EventBusName: this.eventBusName,
          Source: event.source,
          DetailType: event.type,
          Detail: JSON.stringify({
            id: event.id,
            type: event.type,
            version: event.version,
            correlationId: event.correlationId,
            causationId: event.causationId,
            timestamp: event.timestamp.toISOString(),
            source: event.source,
            data: event.data,
            metadata: event.metadata,
          }),
        })),
      });

      const result = await this.client.send(command);

      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        throw new Error(`Failed to publish batch: ${JSON.stringify(result.Entries)}`);
      }
    }
  }
}