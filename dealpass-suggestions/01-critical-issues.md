# 01. Critical Issues & Immediate Fixes

## 🚨 Priority 1: Database Migration (SQLite -> PostgreSQL)
**Current Status:**
- `backend/prisma/schema.prisma` uses `provider = "sqlite"`.
- Data is stored in a local file `dev.db`.
- **Risk:** SQLite locks the entire database during writes. In a multi-user web app, this will cause immediate performance bottlenecks and "Database Locked" errors under even specific load. It also lacks advanced features like connection pooling.

**Recommendation:**
1.  **Spin up PostgreSQL:** Use a managed service (Supabase, Neon, AWS RDS) or a local Docker container.
2.  **Update Schema:** Change provider to `postgresql`.
3.  **Migrate Data:** Use `prisma migrate` to create the schema in Postgres. If preserving data is needed, write a script to read from SQLite and write to Postgres.
4.  **Connection Pooling:** Use `PgBouncer` or Prisma's built-in connection pooling for serverless environments.

## 🚨 Priority 2: Testing Infrastructure
**Current Status:**
- **Zero tests.** No unit tests, no integration tests.
- **Risk:** Any change can break existing functionality. Refactoring is dangerous. Bugs are discovered by users, not developers.

**Recommendation:**
1.  **Install Vitest:** `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
2.  **Unit Tests:** Write tests for utility functions (e.g., `aiModerator.ts`, `jwt.ts`).
3.  **Component Tests:** Test key UI components (Auth forms, Offer cards).
4.  **Integration Tests:** Test API endpoints using `supertest`.
5.  **Goal:** Achieve at least 40% coverage in the first sprint, focusing on critical paths (Login, Checkout, Redemption).

## 🚨 Priority 3: CI/CD Pipeline
**Current Status:**
- No automated build or test process.
- **Risk:** "It works on my machine" syndrome. Manual deployments are error-prone.

**Recommendation:**
1.  **GitHub Actions:** Create `.github/workflows/ci.yml`.
2.  **Steps:**
    - Checkout code.
    - Install dependencies.
    - Lint (`npm run lint`).
    - Build (`npm run build`).
    - Test (`npm run test`).
3.  **Deployment:** Automate deployment to staging on merge to `main`.

## 🚨 Priority 4: Security Basics
**Current Status:**
- Basic JWT auth is present.
- **Risk:** Missing rate limiting, security headers.

**Recommendation:**
1.  **Rate Limiting:** Install `express-rate-limit` to prevent brute-force attacks on login/signup endpoints.
2.  **Helmet:** Install `helmet` middleware to set secure HTTP headers.
3.  **CORS:** Ensure strict CORS policy (allow only your frontend domain).
