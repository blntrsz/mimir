import { z } from "@hono/zod-openapi";

import { Entity, id, timestamps } from "@mimir/backend/lib/entity";

export const activityLogSchema = z.object({
  ...id,
  user_id: z.string().openapi({
    description: "The User's id who did the activity.",
  }),
  event_name: z.string().openapi({
    description: "The event's name for the Activity",
  }),
  meta_data: z.string().openapi({
    description: "The meta data for the activity",
  }),
  created_at: timestamps.created_at,
});

export type ActivityLogSchema = z.infer<typeof activityLogSchema>;

export class ActivityLog extends Entity<ActivityLogSchema> {
  static readonly type = "activity_logs";

  constructor(readonly props: ActivityLogSchema) {
    super();
  }

  toEvent() {
    return {};
  }

  toResponse() {
    return {
      id: this.props.id,
      type: ActivityLog.type,
      attributes: {
        user_id: this.props.user_id,
        created_at: this.props.created_at,
        event_name: this.props.event_name,
        meta_data: this.props.meta_data,
      },
    };
  }
}
