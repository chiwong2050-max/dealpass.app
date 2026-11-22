# 05. Database & Backend Architecture

## 1. PostgreSQL Migration
- **Why:** ACID compliance, concurrency, rich ecosystem.
- **Steps:**
    1.  Provision Postgres.
    2.  Update `schema.prisma`.
    3.  `npx prisma migrate dev --name init_postgres`.
    4.  Update connection strings in `.env`.

## 2. Caching Layer (Redis)
- **Why:** Database hits are expensive. Reading offers is frequent.
- **Implementation:**
    - Store active offers in Redis: `key: offers:active`.
    - Store user sessions: `key: session:{userId}`.
    - Invalidate cache when an offer is updated or redeemed.

## 3. Background Jobs (BullMQ / Redis)
- **Why:** Don't block the main thread for heavy tasks.
- **Use Cases:**
    - Sending emails/push notifications.
    - AI Moderation (if slow).
    - Analytics aggregation.
- **Setup:** `npm install bullmq`. Worker process listens for jobs.

## 4. API Documentation (Swagger/OpenAPI)
- **Why:** Frontend devs (and future public API users) need to know how to use the backend.
- **Implementation:**
    - Use `swagger-jsdoc` and `swagger-ui-express`.
    - Annotate routes with JSDoc comments.
    - Auto-generate `/api-docs` page.

## 5. Logging (Winston/Morgan)
- **Why:** `console.log` is not enough for production.
- **Implementation:**
    - Use `winston` for structured JSON logs.
    - Log levels: `info`, `warn`, `error`.
    - Include `requestId` in every log to trace requests.
