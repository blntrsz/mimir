import { User } from "./user";

export interface UserEventEmitter {
  emitUserCreated(user: User): Promise<void>;
}

export class UserEvents {
  static createdV1(user: User) {
    return {
      eventName: "UserCreated:1",
      body: user.toEvent(),
    };
  }
}
