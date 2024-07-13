import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { z } from "zod";

export interface EventBridgeEvent {
  body: Record<string, any>;
  eventName: string;
}

export class EventBridge {
  eventBridgeName: string;
  eventBridge: EventBridgeClient;

  constructor(eventBridgeName?: string) {
    this.eventBridge = new EventBridgeClient({});
    this.eventBridgeName = z
      .string()
      .parse(eventBridgeName ?? process.env.EVENTBRIDGE_NAME);
  }

  publish(event: EventBridgeEvent) {
    const command = new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify(event.body),
          DetailType: event.eventName,
          EventBusName: this.eventBridgeName,
          Source: `mimir`,
        },
      ],
    });

    return this.eventBridge.send(command);
  }
}
