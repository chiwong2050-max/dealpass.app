# 09. Project Structure & Code Quality

## 1. Monorepo Management
- **Current:** Loose folder structure.
- **Recommendation:** Use **pnpm workspaces** or **Turborepo**.
    - `apps/web` (Frontend)
    - `apps/api` (Backend)
    - `packages/shared` (Shared types, Zod schemas, utilities)
    - **Benefit:** Share TypeScript interfaces between Front and Back seamlessly.

## 2. Code Standards
- **Husky & Lint-Staged:**
    - Run linting and type-checking before every commit.
    - Prevent bad code from entering the repo.
- **Prettier:** Ensure consistent formatting.

## 3. Shared Types
- Currently, types might be duplicated.
- Extract `User`, `Offer` types from Prisma client and export them from a shared package so the frontend uses the exact same types as the DB.
