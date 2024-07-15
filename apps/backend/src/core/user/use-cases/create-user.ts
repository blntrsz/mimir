import { EventEmitter } from "@mimir/backend/core/event/domain/event-emitter";
import { User, UserSchema } from "@mimir/backend/core/user/domain/user";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { AlreadyExistsException, Err, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

import { UserEvents } from "../domain/user.events";

export type CreateUserRequest = Pick<UserSchema, "email">;

export class CreateUser {
  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(
    request: CreateUserRequest,
  ): Promise<Ok<User> | Err<AlreadyExistsException>> {
    this.logger.debug("Create user request", request);

    try {
      const transactionResult = await createTransaction(async () => {
        const existingUser = await this.userRepository.byEmail(request.email);

        if (existingUser) {
          this.logger.debug("User already exists", { existingUser });
          return new AlreadyExistsException("User");
        }

        const newUser = await this.userRepository.insert(request.email);
        this.logger.debug("User created", { user: newUser.toResponse() });

        return newUser;
      });

      if (transactionResult instanceof AlreadyExistsException) {
        return [undefined, transactionResult];
      }

      await this.eventEmitter.publish(UserEvents.createdV1(transactionResult));
      this.logger.debug("User created event has been emitted", {
        user: transactionResult.toResponse(),
      });

      return [transactionResult, undefined];
    } catch (error) {
      this.logger.error("Failed to create user", { error });
      throw error;
    }
  }
}
