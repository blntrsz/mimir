import { EventBridge } from "@mimir/backend/core/event-bridge";
import { User } from "@mimir/backend/core/user/domain/user";
import {
  UserEventEmitter,
  UserEvents,
} from "@mimir/backend/core/user/domain/user.events";

export class EventBridgeUserEvents
  extends EventBridge
  implements UserEventEmitter
{
  async emitUserCreated(user: User) {
    await this.publish(UserEvents.createdV1(user));
  }
}
