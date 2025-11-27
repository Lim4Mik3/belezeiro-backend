import { IEventBus } from "@core/contracts/event-bus/i-event-bus";
import { EventBridgeEventBus } from "@infra/implementations/event-bus/event-bridge-event-bus";

export function makeEventBus(): IEventBus {
  return new EventBridgeEventBus();
}
