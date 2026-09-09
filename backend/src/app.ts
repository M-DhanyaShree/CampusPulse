import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export function createApp(): express.Application {
  const app = express();

  // Basic security and parsing middlewares
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving
  const uploadPath = path.resolve(ENV.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadPath));

  // Swagger Documentation Explorer
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // REST API v1
  app.use('/api/v1', routes);

  // Catch-all 404 and global error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
