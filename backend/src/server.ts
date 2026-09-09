import http from 'http';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketServer } from './socket/index.js';
import { initCronJobs } from './services/cron.service.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    // 1. Connect to MongoDB Community
    await connectDB();

    // 2. Initialize Express Application
    const app = createApp();

    // 3. Create HTTP Server
    const httpServer = http.createServer(app);

    // 4. Mount Socket.io Gateway
    initSocketServer(httpServer);

    // 5. Start Background Cron Tasks (SLA monitors & Poll lifecycle)
    initCronJobs();

    // 6. Listen on Port
    httpServer.listen(ENV.PORT, '0.0.0.0', () => {
      logger.info(`====================================================`);
      logger.info(` CampusPulse AI Backend running in ${ENV.NODE_ENV} mode`);
      logger.info(` Server Listening on: http://0.0.0.0:${ENV.PORT}`);
      logger.info(` API Documentation (Swagger): http://localhost:${ENV.PORT}/api/docs`);
      logger.info(` WebSocket Gateway: ws://localhost:${ENV.PORT}`);
      logger.info(`====================================================`);
    });

    // Graceful Termination
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      httpServer.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Critical failure during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
