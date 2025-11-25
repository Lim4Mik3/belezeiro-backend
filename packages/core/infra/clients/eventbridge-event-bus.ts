import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { IDomainEvent, IEventBus } from "@core/bus/i-event-bus";

/**
 * AWS EventBridge Event Bus implementation
 *
 * Features:
 * - Event routing to multiple targets
 * - Schema registry support
 * - Archive and replay
 * - Cross-account event delivery
 */
export class EventBridgeEventBus implements IEventBus {
  constructor(
    private client: EventBridgeClient,
    private eventBusName: string = "default"
  ) { }

  async publish(event: IDomainEvent): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [{
        EventBusName: this.eventBusName,
        Source: event.source,
        DetailType: event.type,
        Detail: JSON.stringify({
          // Event metadata
          id: event.id,
          version: event.version,
          timestamp: event.timestamp.toISOString(),
          correlationId: event.correlationId,
          causationId: event.causationId,
          // Actual event data
          ...event.data,
        }),
        Time: event.timestamp,
        // Custom metadata as resources (for routing rules)
        ...(event.metadata?.resources && {
          Resources: event.metadata.resources,
        }),
      }],
    });

    const response = await this.client.send(command);

    // Check for failures
    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      const error = response.Entries?.[0];
      throw new Error(`Failed to publish event: ${error?.ErrorCode} - ${error?.ErrorMessage}`);
    }
  }

  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    // EventBridge supports max 10 events per request
    const chunks = this.chunk(events, 10);

    for (const chunk of chunks) {
      const entries = chunk.map(event => ({
        EventBusName: this.eventBusName,
        Source: event.source,
        DetailType: event.type,
        Detail: JSON.stringify({
          id: event.id,
          version: event.version,
          timestamp: event.timestamp.toISOString(),
          correlationId: event.correlationId,
          causationId: event.causationId,
          ...event.data,
        }),
        Time: event.timestamp,
        ...(event.metadata?.resources && {
          Resources: event.metadata.resources,
        }),
      }));

      const command = new PutEventsCommand({ Entries: entries });
      const response = await this.client.send(command);

      // Check for failures
      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        const failedEntries = response.Entries?.filter(e => e.ErrorCode);
        const errors = failedEntries?.map(e => `${e.ErrorCode}: ${e.ErrorMessage}`).join(", ");
        throw new Error(`Failed to publish ${response.FailedEntryCount} events: ${errors}`);
      }
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }
}
