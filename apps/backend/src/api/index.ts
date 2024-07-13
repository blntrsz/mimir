import { serve } from "@hono/node-server";

import { app } from "./app";

serve(app, (address) => {
  console.log(`Listening on ${address.port}`);
});
