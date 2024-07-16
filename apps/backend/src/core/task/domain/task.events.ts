import { Task } from "./task";

export class TaskEvents {
  static createdV1(task: Task) {
    return {
      name: "TaskCreated:1",
      body: task.toEvent(),
    };
  }

  static assignedV1(previousTask: Task, currentTask: Task) {
    return {
      name: "TaskAssigned:1",
      body: {
        previousAssignee: previousTask.toEvent().user_id,
        currentAssignee: currentTask.toEvent().user_id,
      },
    };
  }

  static descriptionUpdatedV1(previousTask: Task, currentTask: Task) {
    return {
      name: "TaskDescriptionUpdated:1",
      body: {
        previousDescription: previousTask.toEvent().description,
        currentDescription: currentTask.toEvent().description,
      },
    };
  }

  static statusUpdatedV1(previousTask: Task, currentTask: Task) {
    return {
      name: "TaskStatusUpdated:1",
      body: {
        previousStatus: previousTask.toEvent().status,
        currentStatus: currentTask.toEvent().status,
      },
    };
  }

  static deletedV1(id: string) {
    return {
      name: "TaskDeleted:1",
      body: {
        id,
      },
    };
  }
}
