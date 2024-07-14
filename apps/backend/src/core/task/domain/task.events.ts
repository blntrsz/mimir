import { Task } from "./task";

export interface TaskEventEmitter {
  emitTaskCreated(task: Task): Promise<void>;
}

export class TaskEvents {
  static createdV1(task: Task) {
    const props = task.props;
    return {
      eventName: "TaskCreated:1",
      body: {
        description: props.description,
        user_id: props.user_id,
        done_at: props.done_at,
      },
    };
  }

  static assignedV1(task: Task) {
    const props = task.props;
    return {
      eventName: "TaskCreated:1",
      body: {
        description: props.description,
        user_id: props.user_id,
        done_at: props.done_at,
      },
    };
  }
}
