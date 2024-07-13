import { User, UserSchema } from "@mimir/backend/core/user/domain/user";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { NotFoundException } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

export type GetUserByEmailRequest = Pick<UserSchema, "email">;

export class GetUserByEmail {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(request: GetUserByEmailRequest): Promise<User | null> {
    this.logger.debug("Get user by email request", request);

    try {
      const user = await this.userRepository.byEmail(request.email);
      this.logger.debug("User received from database", { user });

      if (!user) {
        throw new NotFoundException("User");
      }

      return user;
    } catch (error) {
      this.logger.error("Failed to get user by id", {
        error,
      });
      throw error;
    }
  }
}
