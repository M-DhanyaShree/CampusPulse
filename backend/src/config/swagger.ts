import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from './env.js';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusPulse AI - REST API Documentation',
      version: '1.0.0',
      description:
        'Intelligent Campus Complaint Classification and Opinion Mining Platform. 100% Free and Open-Source Software (FOSS) Backend APIs with RBAC and ML Orchestration.',
      contact: {
        name: 'CampusPulse Engineering Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}/api/v1`,
        description: 'Local Development Server',
      },
      {
        url: `/api/v1`,
        description: 'Current Host Proxy',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide your JWT authorization token in the format: Bearer <token>',
        },
      },
      schemas: {
        StandardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object', nullable: true },
            error: { type: 'string', nullable: true },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Dhanya Shree' },
            email: { type: 'string', example: 'student@campus.edu' },
            role: {
              type: 'string',
              enum: ['student', 'dept_admin', 'management', 'superadmin'],
              example: 'student',
            },
            departmentId: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Complaint: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            trackingCode: { type: 'string', example: 'CP-2026-928412' },
            title: { type: 'string', example: 'Hostel 3 hot water geyser non-functional' },
            description: { type: 'string', example: 'The geyser on 2nd floor has been tripping the circuit breaker.' },
            category: { type: 'string', example: 'Hostel & Residential Life' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
            status: {
              type: 'string',
              enum: ['submitted', 'triaged', 'in_progress', 'resolved', 'rejected', 'escalated'],
              example: 'in_progress',
            },
            upvoteCount: { type: 'number', example: 14 },
            sentiment: {
              type: 'object',
              properties: {
                label: { type: 'string', example: 'negative' },
                score: { type: 'number', example: -0.65 },
                aspects: { type: 'array', items: { type: 'string' } },
              },
            },
            location: {
              type: 'object',
              properties: {
                campusBlock: { type: 'string', example: 'Hostel Block 3' },
                roomOrArea: { type: 'string', example: '2nd Floor Washroom' },
              },
            },
            slaDeadline: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SubTicket: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            parentComplaintId: { type: 'string' },
            title: { type: 'string', example: 'Replace heating element and MCB switch' },
            status: { type: 'string', enum: ['assigned', 'in_progress', 'completed', 'blocked'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
        },
        Poll: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Campus Cafeteria Night Canteen Timings' },
            category: { type: 'string', example: 'Cafeteria & Food Services' },
            status: { type: 'string', enum: ['draft', 'active', 'expired', 'closed'] },
            totalVotes: { type: 'number', example: 342 },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  text: { type: 'string' },
                  voteCount: { type: 'number' },
                },
              },
            },
          },
        },
        Department: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Hostel & Residential Life' },
            code: { type: 'string', example: 'HOSTEL' },
            categories: { type: 'array', items: { type: 'string' } },
            slaHoursDefault: { type: 'number', example: 48 },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Dhanya Shree' },
                    email: { type: 'string', example: 'student@campus.edu' },
                    password: { type: 'string', example: 'SecurePassword123' },
                    role: { type: 'string', enum: ['student', 'dept_admin', 'management', 'superadmin'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful' },
            400: { description: 'Bad request or duplicate email' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Authenticate and receive JWT',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'student@campus.edu' },
                    password: { type: 'string', example: 'SecurePassword123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/complaints': {
        get: {
          summary: 'List campus complaints with multi-parameter filtering and search',
          tags: ['Complaints'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'urgency', schema: { type: 'string' } },
            { in: 'query', name: 'departmentId', schema: { type: 'string' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          ],
          responses: {
            200: { description: 'Complaints list retrieved' },
          },
        },
        post: {
          summary: 'Submit new complaint with automated ML classification and optional attachments',
          tags: ['Complaints'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'campusBlock'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    campusBlock: { type: 'string' },
                    roomOrArea: { type: 'string' },
                    departmentId: { type: 'string' },
                    isAnonymous: { type: 'boolean' },
                    files: { type: 'array', items: { type: 'string', format: 'binary' } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Complaint triaged and created' },
          },
        },
      },
      '/complaints/check-duplicate': {
        post: {
          summary: 'Analyze semantic similarity against open campus tickets to prevent duplicates',
          tags: ['Complaints'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Similarity scored complaints' },
          },
        },
      },
      '/analytics/overview': {
        get: {
          summary: 'Campus resolution KPIs, SLA adherence, and active workloads',
          tags: ['Analytics & Opinion Mining'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'KPI metrics payload' },
          },
        },
      },
      '/analytics/sentiment-trends': {
        get: {
          summary: 'Time-series student opinion polarity trends',
          tags: ['Analytics & Opinion Mining'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Sentiment trend timeline' },
          },
        },
      },
      '/polls': {
        get: {
          summary: 'List campus opinion mining polls',
          tags: ['Opinion Polls'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Polls list' },
          },
        },
        post: {
          summary: 'Create campus opinion mining poll (Admins)',
          tags: ['Opinion Polls'],
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Poll created' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
