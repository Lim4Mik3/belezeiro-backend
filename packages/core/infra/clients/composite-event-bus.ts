import { IDomainEvent, IEventBus } from "@core/bus/i-event-bus";

/**
 * Composite Event Bus - publishes events to multiple destinations
 *
 * Use cases:
 * - Publish to both Redis (for internal consumers) AND SQS (for external services)
 * - Publish to EventBridge (for AWS integrations) AND Redis (for caching)
 * - Gradual migration from one broker to another
 *
 * Example:
 * ```ts
 * const eventBus = new CompositeEventBus([
 *   redisEventBus,
 *   sqsEventBus,
 *   eventBridgeEventBus
 * ]);
 * ```
 */
export class CompositeEventBus implements IEventBus {
  constructor(
    private publishers: IEventBus[],
    private options?: {
      // If true, fails fast on first error
      // If false, collects all errors and throws aggregate error
      failFast?: boolean;
    }
  ) {
    if (publishers.length === 0) {
      throw new Error("CompositeEventBus requires at least one publisher");
    }
  }

  async publish(event: IDomainEvent): Promise<void> {
    if (this.options?.failFast) {
      // Fail on first error
      for (const publisher of this.publishers) {
        await publisher.publish(event);
      }
    } else {
      // Collect all errors
      const results = await Promise.allSettled(
        this.publishers.map(publisher => publisher.publish(event))
      );

      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map(r => r.reason);

      if (errors.length > 0) {
        throw new AggregateError(
          errors,
          `Failed to publish event to ${errors.length}/${this.publishers.length} publishers`
        );
      }
    }
  }

  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    if (this.options?.failFast) {
      for (const publisher of this.publishers) {
        await publisher.publishBatch(events);
      }
    } else {
      const results = await Promise.allSettled(
        this.publishers.map(publisher => publisher.publishBatch(events))
      );

      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map(r => r.reason);

      if (errors.length > 0) {
        throw new AggregateError(
          errors,
          `Failed to publish batch to ${errors.length}/${this.publishers.length} publishers`
        );
      }
    }
  }

  /**
   * Add a new publisher at runtime
   */
  addPublisher(publisher: IEventBus): void {
    this.publishers.push(publisher);
  }

  /**
   * Remove a publisher at runtime
   */
  removePublisher(publisher: IEventBus): void {
    const index = this.publishers.indexOf(publisher);
    if (index > -1) {
      this.publishers.splice(index, 1);
    }
  }
}
