import { Task } from "./task";

export interface TaskEventEmitter {
  emitTaskCreated(task: Task): Promise<void>;
  emitTaskUpdated(prevTask: Task, currentTask: Task): Promise<void>;
}

export class TaskEvents {
  static createdV1(task: Task) {
    return {
      eventName: "TaskCreated:1",
      body: task.toEvent(),
    };
  }

  static updatedV1(prevTask: Task, currentTask: Task) {
    return {
      eventName: "TaskUpdated:1",
      body: {
        prevTask: prevTask.toEvent(),
        currentTask: currentTask.toEvent(),
      },
    };
  }
}
