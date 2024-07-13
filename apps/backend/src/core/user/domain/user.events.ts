import { User } from "./user";

export interface UserEventEmitter {
  emitUserCreated(user: User): Promise<void>;
}

export class UserEvents {
  static createdV1(user: User) {
    const userProps = user.toProps();
    return {
      eventName: "UserCreated:1",
      body: {
        id: userProps.email,
      },
    };
  }
}
