import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

class EventBridgeClientSingleton {
  private static instance: EventBridgeClient;

  private constructor() { }

  public static getInstance(): EventBridgeClient {
    if (!EventBridgeClientSingleton.instance) {
      EventBridgeClientSingleton.instance = new EventBridgeClient({
        region: 'us-east-2'
      });
    }

    return EventBridgeClientSingleton.instance;
  }
}

export const eventBridgeClient = EventBridgeClientSingleton.getInstance();
