import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { IDomainEvent, IEventBus } from "@core/bus/i-event-bus";

/**
 * AWS SQS Event Bus implementation
 *
 * Features:
 * - Standard or FIFO queues
 * - Message attributes for filtering
 * - Batch support (up to 10 messages)
 * - Message deduplication (FIFO)
 */
export class SQSEventBus implements IEventBus {
  constructor(
    private client: SQSClient,
    private queueUrl: string,
    private isFifo: boolean = false
  ) { }

  async publish(event: IDomainEvent): Promise<void> {
    const messageAttributes: Record<string, any> = {
      eventId: { DataType: "String", StringValue: event.id },
      eventType: { DataType: "String", StringValue: event.type },
      version: { DataType: "String", StringValue: event.version },
      source: { DataType: "String", StringValue: event.source },
      timestamp: { DataType: "String", StringValue: event.timestamp.toISOString() },
    };

    if (event.correlationId) {
      messageAttributes.correlationId = { DataType: "String", StringValue: event.correlationId };
    }

    if (event.causationId) {
      messageAttributes.causationId = { DataType: "String", StringValue: event.causationId };
    }

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({
        id: event.id,
        type: event.type,
        version: event.version,
        source: event.source,
        timestamp: event.timestamp,
        correlationId: event.correlationId,
        causationId: event.causationId,
        data: event.data,
        metadata: event.metadata,
      }),
      MessageAttributes: messageAttributes,
      // FIFO-specific parameters
      ...(this.isFifo && {
        MessageGroupId: event.metadata?.messageGroupId || event.type,
        MessageDeduplicationId: event.metadata?.deduplicationId || event.id,
      }),
    });

    await this.client.send(command);
  }

  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    // SQS supports max 10 messages per batch
    const chunks = this.chunk(events, 10);

    for (const chunk of chunks) {
      const entries = chunk.map((event, index) => {
        const messageAttributes: Record<string, any> = {
          eventId: { DataType: "String", StringValue: event.id },
          eventType: { DataType: "String", StringValue: event.type },
          version: { DataType: "String", StringValue: event.version },
          source: { DataType: "String", StringValue: event.source },
          timestamp: { DataType: "String", StringValue: event.timestamp.toISOString() },
        };

        if (event.correlationId) {
          messageAttributes.correlationId = { DataType: "String", StringValue: event.correlationId };
        }

        if (event.causationId) {
          messageAttributes.causationId = { DataType: "String", StringValue: event.causationId };
        }

        return {
          Id: `${index}`,
          MessageBody: JSON.stringify({
            id: event.id,
            type: event.type,
            version: event.version,
            source: event.source,
            timestamp: event.timestamp,
            correlationId: event.correlationId,
            causationId: event.causationId,
            data: event.data,
            metadata: event.metadata,
          }),
          MessageAttributes: messageAttributes,
          ...(this.isFifo && {
            MessageGroupId: event.metadata?.messageGroupId || event.type,
            MessageDeduplicationId: event.metadata?.deduplicationId || event.id,
          }),
        };
      });

      const command = new SendMessageBatchCommand({
        QueueUrl: this.queueUrl,
        Entries: entries,
      });

      await this.client.send(command);
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }
}
