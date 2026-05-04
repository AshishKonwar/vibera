import { createApp } from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

async function main(): Promise<void> {
  try {
    await connectDB();

    const app = createApp();

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  logger.info("Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Termination signal received...");
  process.exit(0);
});

main();