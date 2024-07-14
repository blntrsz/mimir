import { EventBridge } from "@mimir/backend/core/event-bridge";
import { Task } from "@mimir/backend/core/task/domain/task";
import {
  TaskEventEmitter,
  TaskEvents,
} from "@mimir/backend/core/task/domain/task.events";

export class EventBridgeTaskEvents
  extends EventBridge
  implements TaskEventEmitter
{
  async emitTaskCreated(task: Task) {
    await this.publish(TaskEvents.createdV1(task));
  }

  async emitTaskUpdated(prevTask: Task, currentTask: Task) {
    await this.publish(TaskEvents.updatedV1(prevTask, currentTask));
  }
}
