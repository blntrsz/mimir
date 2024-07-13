import { User, UserSchema } from "@mimir/backend/core/user/domain/user";
import { UserEventEmitter } from "@mimir/backend/core/user/domain/user.events";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { AlreadyExistsException, Err, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

export type CreateUserRequest = Pick<UserSchema, "email">;

export class CreateUser {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly userEventEmitter: UserEventEmitter,
  ) {}

  async onRequest(
    request: CreateUserRequest,
  ): Promise<Ok<User> | Err<AlreadyExistsException>> {
    this.logger.debug("Create user request", request);

    try {
      const [user, error] = await createTransaction(async () => {
        const existingUser = await this.userRepository.byEmail(request.email);

        if (existingUser) {
          this.logger.debug("User already exists", { existingUser });
          return [undefined, new AlreadyExistsException("User")];
        }

        const newUser = await this.userRepository.insert(request.email);
        this.logger.debug("User created", { user: newUser.toResponse() });

        return [newUser, undefined];
      });

      if (user) {
        await this.userEventEmitter.emitUserCreated(user);
        this.logger.debug("User created event has been emitted", {
          user: user.toResponse(),
        });

        return [user, undefined];
      }

      return [undefined, error];
    } catch (error) {
      this.logger.error("Failed to create user", { error });
      throw error;
    }
  }
}
