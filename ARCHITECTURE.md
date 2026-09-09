# CampusPulse AI - Architecture & System Design Document

**Intelligent Campus Complaint Classification and Opinion Mining Platform**  
*100% Free and Open-Source Software (FOSS) Stack*

---

## 1. Complete Architecture

### 1.1 Executive Overview
CampusPulse AI is a modern campus grievance management and opinion analytics platform. It automatically ingests student and staff complaints, classifies them by department and category, analyzes urgency and sentiment, detects duplicate or clustered issues, routes complaints to assigned authorities, and provides real-time tracking with administrative intelligence dashboards.

### 1.2 High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                           CLIENT TIER                                              |
|                                                                                                    |
|    +------------------------------------------------------------------------------------------+    |
|    |                      React 18/19 SPA (Vite + TypeScript + Tailwind CSS)                 |    |
|    |           shadcn/ui | TanStack Query | Recharts | Axios | Socket.io-client               |    |
|    +------------------------------------------------------------------------------------------+    |
+----------------------------------------------------------------------------------------------------+
                                      |                             ^
                           HTTPS / REST Requests             WSS / Socket.io Events
                                      |                             |
+----------------------------------------------------------------------------------------------------+
|                                         APPLICATION TIER                                           |
|                                                                                                    |
|    +------------------------------------------------------------------------------------------+    |
|    |                      Node.js / Express.js Service (TypeScript)                           |    |
|    |  - Authentication & RBAC (JWT & bcrypt)                                                  |    |
|    |  - Multipart File Uploads (Multer -> Local /data volume)                                 |    |
|    |  - Complaint Lifecycle & Workflow State Machine                                          |    |
|    |  - Real-time Notification Dispatcher (Socket.io)                                         |    |
|    |  - Internal Service Client (Axios to ML Service)                                         |    |
|    |  - ORM / ODM Data Layer (Mongoose)                                                       |    |
|    +------------------------------------------------------------------------------------------+    |
+----------------------------------------------------------------------------------------------------+
                   |                                           |
          Internal REST (HTTP)                       Mongoose ODM (TCP)
                   v                                           v
+------------------------------------+    +----------------------------------------------------------+
|          ML INFERENCE TIER         |    |                      DATA TIER                           |
|                                    |    |                                                          |
|  +------------------------------+  |    |  +----------------------------------------------------+  |
|  |  Python FastAPI Microservice |  |    |  |  MongoDB Community Edition (v7.x)                  |  |
|  |  - Category Classification   |  |    |  |  - Users & Roles                                   |  |
|  |    (Hugging Face Transformer)|  |    |  |  - Complaints & Attachments                        |  |
|  |  - Urgency/Priority Scoring  |  |    |  |  - Departments & Resolution Staff                  |  |
|  |    (Scikit-Learn Classifier) |  |    |  |  - Sentiment & Opinion Aggregates                  |  |
|  |  - Sentiment & Opinion Mining|  |    |  |  - Comments, Votes, & Audit Logs                   |  |
|  |    (spaCy + Transformer)     |  |    |  |  - In-app Notification Records                     |  |
|  |  - Semantic Similarity &     |  |    |  +----------------------------------------------------+  |
|  |    Duplicate Cluster Search  |  |    |                                                          |
|  |    (Sentence Transformers:   |  |    |  +----------------------------------------------------+  |
|  |     all-MiniLM-L6-v2)        |  |    |  |  Shared Storage Volume (/data)                     |  |
|  +------------------------------+  |    |  |  - Uploaded Images / Document Attachments          |  |
+------------------------------------+    |  |  - Model Weights & Cached Embedding Vectors        |  |
                                          |  +----------------------------------------------------+  |
                                          +----------------------------------------------------------+
```

### 1.3 Core Architectural Principles
1. **Loose Coupling & Service Isolation**: The Node.js backend handles business workflows, transactional integrity, authentication, and user-facing WebSockets. The Python FastAPI service operates strictly as a specialized stateless inference engine.
2. **Local Inference (FOSS)**: All NLP models (Transformers, spaCy, Sentence-Transformers) run locally within Docker containers without requiring paid proprietary third-party APIs.
3. **Optimistic Updates & Real-Time Sync**: Complaint status transitions, administrator comments, and upvotes propagate via Socket.io channels, while React Query handles client caching, cache invalidation, and background synchronization.
4. **Data Isolation & Ephemeral Caching**: Sensitive campus data remains strictly on-premise within the MongoDB Community container and local volumes.

---

## 2. Complete Folder Structure

```
CampusPulse/
├── ARCHITECTURE.md                    # System architecture and design documentation
├── README.md                          # Project setup and developer guidelines
├── docker-compose.yml                 # Production multi-container orchestration
├── docker-compose.dev.yml             # Development orchestration with live reload
├── .gitignore                         # Global git ignore definitions
│
├── frontend/                          # Client Web Application
│   ├── Dockerfile                     # Multi-stage Nginx build for production
│   ├── Dockerfile.dev                 # Vite dev server container
│   ├── index.html                     # Entry HTML document
│   ├── package.json                   # Dependencies & scripts
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Tailwind CSS tokens and themes
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.node.json             # Node-specific TS config
│   ├── vite.config.ts                 # Vite bundler & reverse proxy setup
│   └── src/
│       ├── main.tsx                   # Application bootstrap
│       ├── App.tsx                    # Root routing and global providers
│       ├── index.css                  # Tailwind styles and custom primitives
│       ├── assets/                    # Static images, SVG badges, logos
│       ├── components/                # Reusable presentation components
│       │   ├── ui/                    # shadcn/ui primitives (button, dialog, card, etc.)
│       │   ├── layout/                # Header, Sidebar, Footer, Breadcrumbs
│       │   ├── complaints/            # ComplaintCard, ComplaintFeed, StatusBadge, UrgencyBadge
│       │   ├── analytics/             # SentimentChart, TrendGraph, DepartmentHeatmap
│       │   └── common/                # ProtectedRoute, EmptyState, FileDropzone, ThemeToggle
│       ├── context/                   # React Contexts (AuthContext, SocketContext)
│       ├── hooks/                     # Custom hooks (useComplaints, useSocket, useDebounce)
│       ├── lib/                       # Utility helpers (utils.ts, cn() helper)
│       ├── services/                  # API client layers
│       │   ├── api.ts                 # Axios base instance with interceptors
│       │   ├── authService.ts         # Login, Register, Profile, Refresh
│       │   ├── complaintService.ts    # CRUD & Search for Complaints
│       │   └── analyticsService.ts   # Sentiment & Aggregation endpoints
│       ├── pages/                     # Route Views
│       │   ├── auth/                  # Login, Register, ResetPassword
│       │   ├── student/               # SubmitComplaint, MyComplaints, PublicFeed
│       │   ├── resolver/              # DepartmentQueue, TicketDetail, ResolutionAction
│       │   ├── admin/                 # OverviewDashboard, UserManagement, Escalations
│       │   └── NotFound.tsx           # 404 Page
│       └── types/                     # TypeScript Interfaces and DTOs
│           ├── auth.types.ts
│           ├── complaint.types.ts
│           ├── analytics.types.ts
│           └── socket.types.ts
│
├── backend/                           # API Gateway & Workflow Orchestrator
│   ├── Dockerfile                     # Node.js production container build
│   ├── Dockerfile.dev                 # Dev container with nodemon/tsx hot reload
│   ├── package.json                   # Backend dependencies & scripts
│   ├── tsconfig.json                  # TypeScript compiler options
│   └── src/
│       ├── server.ts                  # Server entry point, HTTP & Socket.io server
│       ├── app.ts                     # Express app setup, middleware chaining
│       ├── config/                    # Configurations
│       │   ├── db.ts                  # Mongoose connection logic & reconnect hooks
│       │   ├── env.ts                 # Validated environment variable schema (zod/envalid)
│       │   └── socket.ts              # Socket.io instance and room management
│       ├── constants/                 # Enums (Roles, Statuses, Categories, Priorites)
│       ├── controllers/               # Request handling and response dispatch
│       │   ├── auth.controller.ts
│       │   ├── complaint.controller.ts
│       │   ├── analytics.controller.ts
│       │   ├── department.controller.ts
│       │   └── user.controller.ts
│       ├── middlewares/               # Custom Express middlewares
│       │   ├── auth.middleware.ts     # JWT validation and Bearer parser
│       │   ├── role.middleware.ts     # Granular RBAC enforcement
│       │   ├── upload.middleware.ts   # Multer local storage handler & mime filter
│       │   ├── error.middleware.ts    # Global exception handler & formatted error responses
│       │   └── validate.middleware.ts # Zod/Joi request validation
│       ├── models/                    # Mongoose Schemas & Models
│       │   ├── User.model.ts
│       │   ├── Complaint.model.ts
│       │   ├── Department.model.ts
│       │   ├── Comment.model.ts
│       │   ├── AuditLog.model.ts
│       │   └── Notification.model.ts
│       ├── routes/                    # API Route declarations
│       │   ├── auth.routes.ts
│       │   ├── complaint.routes.ts
│       │   ├── analytics.routes.ts
│       │   ├── department.routes.ts
│       │   └── user.routes.ts
│       ├── services/                  # Business Logic
│       │   ├── mlClient.service.ts    # HTTP integration with Python FastAPI service
│       │   ├── complaint.service.ts   # Core complaint processing & state transition
│       │   ├── socket.service.ts      # Event emitter helper for room broadcasts
│       │   └── notification.service.ts# Persistent in-app notifications
│       └── utils/                     # Generic utility functions
│           ├── logger.ts              # Structured Winston / Pino logger
│           └── responseHandler.ts     # Standardized JSON response envelope
│
├── ml/                                # Machine Learning & NLP Microservice
│   ├── Dockerfile                     # Python 3.11 image with PyTorch & dependencies
│   ├── Dockerfile.dev                 # Dev container with volume mount & reload
│   ├── requirements.txt               # Python package manifest
│   ├── download_models.py             # Script to pre-download Hugging Face weights at build
│   └── app/
│       ├── main.py                    # FastAPI application initialization
│       ├── config.py                  # ML configuration & hyperparameter constants
│       ├── models/                    # Pydantic Request & Response schemas
│       │   ├── classification.py
│       │   ├── sentiment.py
│       │   └── similarity.py
│       ├── routes/                    # FastAPI routers
│       │   ├── predict.py             # Category & priority prediction endpoints
│       │   ├── sentiment.py           # Sentiment & opinion extraction endpoints
│       │   ├── similarity.py          # Vector comparison & duplicate detection
│       │   └── health.py              # Liveness and model loading probes
│       ├── services/                  # Core Model Managers & Pipelines
│       │   ├── classifier.py          # DistilBERT/RoBERTa text classification
│       │   ├── sentiment_analyzer.py  # Aspect-based sentiment analysis via spaCy
│       │   ├── similarity_engine.py   # Sentence-Transformers cosine similarity
│       │   └── preprocessor.py        # Text sanitization, token cleanup, lemmatization
│       └── utils/
│           ├── logger.py              # Python logging configuration
│           └── text_cleaner.py        # RegEx and unicode normalizer
│
└── data/                              # Persistent Data Volumes & Artifacts
    ├── uploads/                       # User-uploaded complaint attachments/images
    ├── models/                        # Pre-downloaded weights and spaCy models
    │   ├── sentencetransformers/      # all-MiniLM-L6-v2 local cache
    │   └── spacy/                     # en_core_web_sm pipeline artifacts
    └── mongo_data/                    # Docker MongoDB Community volume mount
```

---

## 3. Comprehensive API Design

All API endpoints return a standardized envelope format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description",
  "error": null
}
```

### 3.1 Authentication & User Management (`/api/v1/auth`, `/api/v1/users`)

| Method | Endpoint | Access Level | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user (Student / Faculty) | `{ name, email, password, role, departmentId? }` | `201 Created` `{ user, token }` |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue JWT | `{ email, password }` | `200 OK` `{ user, token }` |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch authenticated user profile | Header: `Authorization: Bearer <token>` | `200 OK` `{ user }` |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Update user password | `{ currentPassword, newPassword }` | `200 OK` |
| `GET` | `/api/v1/users` | Admin | List all registered users (paginated) | Query: `?page=1&limit=20&role=resolver` | `200 OK` `{ users, pagination }` |
| `PATCH` | `/api/v1/users/:id/role` | Super Admin | Change user role or assign department | `{ role, departmentId }` | `200 OK` `{ user }` |

### 3.2 Complaints Management (`/api/v1/complaints`)

| Method | Endpoint | Access Level | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/complaints` | Student / Staff | Create complaint (with file attachment) | `multipart/form-data`: `title`, `description`, `location`, `isAnonymous`, `files` | `201 Created` `{ complaint, duplicateSuggestions }` |
| `GET` | `/api/v1/complaints` | Authenticated | List complaints (filtered by role & visibility) | Query: `?status=open&departmentId=123&search=wifi&page=1` | `200 OK` `{ complaints, total }` |
| `GET` | `/api/v1/complaints/:id` | Authenticated | Retrieve full complaint details | Param: `id` (Complaint ObjectId) | `200 OK` `{ complaint, timeline, comments }` |
| `PATCH` | `/api/v1/complaints/:id/status` | Resolver / Admin | Transition status (In Progress, Resolved, etc.) | `{ status, resolutionNotes, assignedResolverId? }` | `200 OK` `{ complaint }` |
| `POST` | `/api/v1/complaints/:id/upvote` | Student / Staff | Upvote/endorse an open campus complaint | None | `200 OK` `{ upvoteCount, hasUpvoted }` |
| `POST` | `/api/v1/complaints/:id/comments` | Authenticated | Post an update or query on the complaint | `{ text, isOfficialUpdate }` | `201 Created` `{ comment }` |
| `POST` | `/api/v1/complaints/check-duplicate` | Student / Staff | Check for duplicates before final submission | `{ title, description }` | `200 OK` `{ duplicates: [...] }` |

### 3.3 Analytics & Opinion Mining (`/api/v1/analytics`)

| Method | Endpoint | Access Level | Description | Query Parameters | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/overview` | Admin / Resolver | High-level metrics: total, resolved, average SLA | `?departmentId=&from=&to=` | `200 OK` `{ total, resolvedRatio, avgResolutionHours }` |
| `GET` | `/api/v1/analytics/sentiment-trends` | Admin | Aggregate sentiment polarity over time | `?interval=daily&range=30d` | `200 OK` `{ series: [{ date, positive, neutral, negative }] }` |
| `GET` | `/api/v1/analytics/category-distribution`| Admin / Resolver | Complaints breakdown by ML-categorized tags | `?departmentId=` | `200 OK` `{ categories: [{ name, count, percent }] }` |
| `GET` | `/api/v1/analytics/hotspots` | Admin | Campus location & urgent issue hotspots | None | `200 OK` `{ hotspots: [{ location, count, topCategory }] }` |

### 3.4 Internal ML Microservice API (`http://ml-service:8000`)

| Method | Endpoint | Consumer | Description | Request Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ml/classify` | Node.js Backend | Predict category and urgency score | `{"text": "Hostel 4 washrooms have no water supply for 2 days"}` | `{"category": "Hostel & Facilities", "confidence": 0.94, "urgency": "High", "urgency_score": 0.88}` |
| `POST` | `/api/ml/sentiment` | Node.js Backend | Extract polarity, emotional tone, and key phrases | `{"text": "The mess food quality has deteriorated severely this week"}` | `{"sentiment": "Negative", "polarity": -0.78, "key_aspects": ["mess food", "food quality"]}` |
| `POST` | `/api/ml/similarity` | Node.js Backend | Query semantic similarity against active tickets | `{"query": "Library AC is leaking", "corpus": [{"id": "...", "text": "..."}]}` | `{"matches": [{"id": "...", "similarity_score": 0.89}]}` |
| `GET` | `/api/ml/health` | Docker / Node.js| Check model loading & GPU/CPU status | None | `{"status": "ready", "models_loaded": true}` |

---

## 4. Database Design (MongoDB & Mongoose Schemas)

### 4.1 Schema Relationship Entity Diagram

```
+-------------------+           +-------------------+           +---------------------+
|      User         |           |    Department     |           |     AuditLog        |
+-------------------+           +-------------------+           +---------------------+
| _id               |           | _id               |           | _id                 |
| name              |           | name              |           | complaintId (Ref)   |
| email (Unique)    |           | code (Unique)     |           | performedBy (Ref)   |
| password (Hash)   |           | headOfDept (Ref)  |           | action              |
| role (Enum)       |<---+      | categories: []    |           | changes: {}         |
| departmentId(Ref) |--+ |      +-------------------+           | timestamp           |
| isActive          |  | |                ^                     +---------------------+
+-------------------+  | |                |
                       | |                |
                       | |      +-------------------+
                       | |      |    Complaint      |
                       | |      +-------------------+
                       | |      | _id               |
                       | +----->| departmentId (Ref)|
                       |        | createdBy (Ref)   |
                       |        | title             |
                       |        | description       |
                       |        | location          |
                       |        | status (Enum)     |
                       |        | urgency (Enum)    |
                       |        | category (Enum)   |
                       |        | sentiment (Embed) |
                       |        | embedding: []     |
                       |        | attachments: []   |
                       |        | upvotes: [Ref]    |
                       |        | assignedTo (Ref)  |
                       |        | isAnonymous       |
                       |        +-------------------+
                       |                  ^
                       |                  |
                       |        +-------------------+
                       |        |     Comment       |
                       |        +-------------------+
                       |        | _id               |
                       +------->| complaintId (Ref) |
                                | authorId (Ref)    |
                                | text              |
                                | isOfficial        |
                                +-------------------+
```

### 4.2 Data Models Specification

#### `User` Model
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'resolver', 'admin', 'superadmin'], 
    default: 'student', 
    index: true 
  },
  departmentId: { type: ObjectId, ref: 'Department', default: null },
  avatarUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### `Department` Model
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g., 'HOSTEL', 'IT_INFRA', 'ACADEMIC'
  description: { type: String },
  leadOfficerId: { type: ObjectId, ref: 'User' },
  categories: [{ type: String }], // Pre-defined complaint categories under this dept
  slaHoursDefault: { type: Number, default: 48 }, // Service Level Agreement in hours
  createdAt: { type: Date, default: Date.now }
}
```

#### `Complaint` Model
```typescript
{
  _id: ObjectId,
  trackingCode: { type: String, required: true, unique: true, index: true }, // e.g. "CP-2026-0841"
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true, index: true },
  isAnonymous: { type: Boolean, default: false },
  departmentId: { type: ObjectId, ref: 'Department', required: true, index: true },
  
  // Classification fields (populated by ML service upon creation)
  category: { type: String, required: true, index: true },
  mlClassificationConfidence: { type: Number },
  urgency: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium', 
    index: true 
  },
  urgencyScore: { type: Number, min: 0, max: 1 },
  
  // Opinion Mining & Sentiment fields
  sentiment: {
    label: { type: String, enum: ['positive', 'neutral', 'negative'] },
    score: { type: Number }, // -1.0 to +1.0
    aspects: [{ type: String }]
  },
  
  // Dense text embedding vector for duplicate search
  embedding: { type: [Number], select: false }, // 384-dimensional vector from all-MiniLM-L6-v2
  
  location: {
    campusBlock: { type: String, required: true },
    roomOrArea: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  status: {
    type: String,
    enum: ['submitted', 'triaged', 'in_progress', 'resolved', 'rejected', 'escalated'],
    default: 'submitted',
    index: true
  },
  
  assignedResolver: { type: ObjectId, ref: 'User', default: null, index: true },
  attachments: [{
    fileName: String,
    fileUrl: String,
    mimeType: String,
    fileSizeBytes: Number
  }],
  
  upvotes: [{ type: ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0, index: true },
  
  duplicateOf: { type: ObjectId, ref: 'Complaint', default: null }, // Linked ticket if duplicate
  
  slaDeadline: { type: Date },
  resolvedAt: { type: Date, default: null },
  resolutionSummary: { type: String, default: null },
  
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}
```

#### `Comment` Model
```typescript
{
  _id: ObjectId,
  complaintId: { type: ObjectId, ref: 'Complaint', required: true, index: true },
  authorId: { type: ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isOfficialUpdate: { type: Boolean, default: false },
  attachments: [String],
  createdAt: { type: Date, default: Date.now }
}
```

#### `AuditLog` Model
```typescript
{
  _id: ObjectId,
  complaintId: { type: ObjectId, ref: 'Complaint', required: true, index: true },
  performedBy: { type: ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "STATUS_CHANGE", "ASSIGNED_RESOLVER", "PRIORITY_ESCALATION"
  previousValue: { type: Object },
  newValue: { type: Object },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
}
```

#### `Notification` Model
```typescript
{
  _id: ObjectId,
  recipientId: { type: ObjectId, ref: 'User', required: true, index: true },
  complaintId: { type: ObjectId, ref: 'Complaint', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  type: { type: String, enum: ['STATUS_UPDATE', 'ASSIGNMENT', 'COMMENT', 'ESCALATION'] },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 5. User Roles and RBAC Permissions Matrix

The platform implements five distinct user personas with strict hierarchical permissions:

1. **Student (`student`)**: Regular campus attendees who submit grievances, track personal reports, view public complaints, and upvote community issues.
2. **Faculty / Staff (`faculty`)**: Campus employees reporting classroom or institutional facility issues, with identical submission privileges plus academic priority tagging.
3. **Department Resolver (`resolver`)**: Operational staff (e.g., Electrician, IT admin, Hostel warden) assigned to inspect, update progress, comment, and resolve tickets under their specific department.
4. **Campus Admin (`admin`)**: Institutional authorities managing departments, reviewing department SLAs, manually overriding classifications, reassigning tickets, and accessing opinion dashboards.
5. **Super Admin (`superadmin`)**: Platform custodians managing user roles, department schemas, system logs, and microservice orchestrations.

### Permissions Matrix

| Capability / Action | Student | Faculty | Resolver | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Submit New Complaint |  |  |  |  |  |
| View Personal Complaints |  |  |  |  |  |
| View Public Community Complaints |  |  |  |  |  |
| Upvote Community Complaints |  |  |  |  |  |
| Add Comment on Assigned Ticket | Self-owned | Self-owned | Dept only | Any | Any |
| View Department Operational Queue | ❌ | ❌ | Dept only | Any | Any |
| Update Status (`in_progress`, `resolved`) | ❌ | ❌ | Dept only | Any | Any |
| Override ML Classification & Urgency | ❌ | ❌ | ❌ |  |  |
| Reassign Complaint to Another Dept | ❌ | ❌ | ❌ |  |  |
| Access Sentiment & Analytics Dashboard | ❌ | ❌ | Dept only | Full | Full |
| Manage User Roles & Accounts | ❌ | ❌ | ❌ | View only | Full |
| Department Configuration & SLAs | ❌ | ❌ | ❌ | View only | Full |

---

## 6. Communication Flow

### 6.1 Complaint Ingestion & ML Pipeline (Synchronous Submission with Fast Async Fallback)

```
[Student / Client]            [Node.js Backend]              [FastAPI ML Service]          [MongoDB]
        |                             |                               |                        |
        | 1. POST /complaints (form)  |                               |                        |
        |---------------------------->|                               |                        |
        |                             | 2. Store files to /data/upload|                        |
        |                             | 3. Call POST /api/ml/classify |                        |
        |                             |------------------------------>|                        |
        |                             |                               | 4. Run DistilBERT      |
        |                             |                               |    + Priority Rules    |
        |                             | 5. Return Category & Urgency  |                        |
        |                             |<------------------------------|                        |
        |                             |                               |                        |
        |                             | 6. Call POST /api/ml/sentiment|                        |
        |                             |------------------------------>|                        |
        |                             |                               | 7. Run spaCy + Polarity|
        |                             | 8. Return Sentiment & Aspects |                        |
        |                             |<------------------------------|                        |
        |                             |                               |                        |
        |                             | 9. Save Complaint Document    |                        |
        |                             |------------------------------------------------------->|
        |                             | 10. Emit Socket: "ticket:new" to Dept Room             |
        |                             |--[Broadcast to Resolvers]     |                        |
        | 11. 201 Created             |                               |                        |
        |<----------------------------|                               |                        |
```

### 6.2 Pre-submission Duplicate Check Flow
1. User types complaint title and description in the React frontend.
2. An automatic debounced call (600ms) triggers `POST /api/v1/complaints/check-duplicate`.
3. Node.js backend retrieves vector embeddings from the Python ML service (`/api/ml/similarity`).
4. ML service compares query vector against active complaint vectors stored in memory or recent records using cosine similarity:
   $$\text{similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
5. If similarity exceeds $0.80$, the frontend displays a banner: *"Similar issue already reported at Hostel 3. Upvote it instead?"*

### 6.3 Real-time Resolution & Status Updates via Socket.io
1. Resolver changes status of ticket `#CP-2026-0841` to `Resolved` with resolution remarks.
2. Node.js backend saves update in MongoDB and creates an `AuditLog` entry.
3. Node.js server fires:
   - `socket.to("user:" + complaint.createdBy).emit("complaint:updated", data)`
   - `socket.to("dept:" + complaint.departmentId).emit("complaint:status_changed", data)`
4. Student's client catches the event via `SocketContext` and prompts a notification toast + updates React Query cache without requiring page refresh.

---

## 7. Docker Architecture & Containerization

### 7.1 Docker Compose Services Topology

```
+-----------------------------------------------------------------------------------------+
|                                    campuspulse-net                                      |
|                                                                                         |
|  +------------------+         +------------------+         +-------------------------+  |
|  |     frontend     |         |     backend      |         |       ml-service        |  |
|  | (Nginx / Vite)   |         | (Node.js/Express)|         |    (Python / FastAPI)   |  |
|  | Port: 3000:80    |         | Port: 5000:5000  |         | Port: 8000 (internal)   |  |
|  +------------------+         +------------------+         +-------------------------+  |
|           |                            |                                |               |
|           | (Reverse Proxy)            | (Internal HTTP)                |               |
|           +--------------------------->|--------------------------------+               |
|                                        |                                                |
|                                        | (Mongoose TCP)                                 |
|                                        v                                                |
|                               +------------------+                                      |
|                               |     mongodb      |                                      |
|                               | (Mongo Community)|                                      |
|                               | Port: 27017      |                                      |
|                               +------------------+                                      |
|                                                                                         |
|   Volumes:                                                                              |
|     - mongo_data   -> /data/db                                                          |
|     - shared_data  -> /data/uploads, /data/models                                       |
+-----------------------------------------------------------------------------------------+
```

### 7.2 Service Definitions (`docker-compose.yml` specification)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0-jammy
    container_name: campuspulse-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASS:-password123}
      MONGO_INITDB_DATABASE: campuspulse
    volumes:
      - mongo_data:/data/db
    networks:
      - campuspulse-net
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  ml-service:
    build:
      context: ./ml
      dockerfile: Dockerfile
    container_name: campuspulse-ml
    restart: unless-stopped
    expose:
      - "8000"
    volumes:
      - model_cache:/root/.cache
      - shared_data:/data
    environment:
      - PYTHONUNBUFFERED=1
      - MODEL_CACHE_DIR=/data/models
    networks:
      - campuspulse-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/ml/health"]
      interval: 15s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campuspulse-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
      ml-service:
        condition: service_healthy
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGO_URI=mongodb://${MONGO_ROOT_USER:-admin}:${MONGO_ROOT_PASS:-password123}@mongodb:27017/campuspulse?authSource=admin
      - ML_SERVICE_URL=http://ml-service:8000
      - JWT_SECRET=${JWT_SECRET}
      - CLIENT_URL=http://localhost:3000
      - UPLOAD_DIR=/data/uploads
    volumes:
      - shared_data:/data
    networks:
      - campuspulse-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: campuspulse-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - campuspulse-net

volumes:
  mongo_data:
    name: campuspulse_mongo_data
  shared_data:
    name: campuspulse_shared_data
  model_cache:
    name: campuspulse_model_cache

networks:
  campuspulse-net:
    driver: bridge
```

---

## 8. Required Environment Variables

### 8.1 Backend Environment Variables (`backend/.env`)

```env
# Application Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (MongoDB Community)
MONGO_URI=mongodb://admin:password123@localhost:27017/campuspulse?authSource=admin

# JWT Authentication
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# ML Service Internal Integration
ML_SERVICE_URL=http://localhost:8000
ML_REQUEST_TIMEOUT_MS=10000

# File Upload Configuration
UPLOAD_DIR=../data/uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Logging & Monitoring
LOG_LEVEL=debug
```

### 8.2 Frontend Environment Variables (`frontend/.env`)

```env
# Public API & Gateway
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Real-time WebSocket Gateway
VITE_SOCKET_URL=http://localhost:5000

# App Meta Branding
VITE_APP_NAME="CampusPulse AI"
VITE_APP_DESCRIPTION="Intelligent Campus Complaint Classification & Opinion Mining"
```

### 8.3 ML Microservice Environment Variables (`ml/.env`)

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=2
LOG_LEVEL=info

# Hugging Face & Transformer Cache
HF_HOME=/data/models/huggingface
TRANSFORMERS_CACHE=/data/models/transformers
SENTENCE_TRANSFORMERS_HOME=/data/models/sentence_transformers

# NLP Model Selection (FOSS Models)
CLASSIFICATION_MODEL_NAME=distilbert-base-uncased
SIMILARITY_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm

# Inference Tuning
DEVICE=cpu                     # Use 'cuda' if NVIDIA GPU container toolkit is present
SIMILARITY_THRESHOLD=0.82      # Cosine threshold for duplicate flag
```
