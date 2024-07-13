import { User, UserSchema } from "./user";

export interface UserRepository {
  insert(email: UserSchema["email"]): Promise<User>;
  byEmail(email: UserSchema["email"]): Promise<User | null>;
  byId(id: UserSchema["id"]): Promise<User | null>;
}
