import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { z } from "zod";

import {
  Event,
  EventEmitter,
} from "@mimir/backend/core/event/domain/event-emitter";

export class EventBridge implements EventEmitter {
  eventBridgeName: string;
  eventBridge: EventBridgeClient;

  constructor(eventBridgeName?: string) {
    this.eventBridge = new EventBridgeClient({});
    this.eventBridgeName = z
      .string()
      .parse(eventBridgeName ?? process.env.EVENTBRIDGE_NAME);
  }

  async publish(event: Event) {
    const command = new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify(event.body),
          DetailType: event.name,
          EventBusName: this.eventBridgeName,
          Source: `mimir`,
        },
      ],
    });

    await this.eventBridge.send(command);
  }
}
