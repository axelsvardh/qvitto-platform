import "dotenv/config";
import { assertRequiredEnv } from "./config.js";

// Check secrets before loading any route (and with it Prisma), so a missing
// one stops the server straight away with a clear message.
try {
  assertRequiredEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const { createApp } = await import("./app.js");

const PORT = process.env.PORT || 4000;
createApp().listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
