# DealPass.app

**Local Deals, Real Savings.**

DealPass is a Progressive Web App (PWA) platform connecting local businesses with customers through a fair, credit-based coupon system.

## Project Summary

We are building a global local-deals platform where:
1.  **Users** discover local secrets (2-for-1 meals, spa days, etc.) and unlock them using credits.
2.  **Businesses** list promotions to fill off-peak times and track real ROI through redemption scans.

## Key Concepts

*   **Credit Economy:** Users don't pay subscription fees upfront. They start with free credits and earn more by sharing/inviting.
*   **Viral Growth:** Every offer has a smart shareable URL. Users are incentivized to promote businesses.
*   **Retention Engine:** When a user redeems a deal, they are tagged. The system can later automatically notify them of new offers from that specific business to drive repeat visits.
*   **PWA First:** Built as a mobile-first web app that is installable on iOS and Android without an app store.

## Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, Vite (PWA).
*   **Backend:** Node.js, Express. In production the same Express process also serves the built frontend, so the whole app runs as **one Node process** (no Vite dev server).
*   **Database:** SQLite via Prisma (standalone file database - no hosted/paid DB required).
*   **AI:** Simulated AI Concierge & Business Analytics.

## Key Features Implemented

*   **Multi-Region & Multi-Language:** Ready for global scale (EN/ZH support).
*   **QR Redemption:** Built-in camera scanner for staff to verify coupons via `getUserMedia`.
*   **Business Dashboard:** Analytics on views, unlocks, and redemptions.
*   **Smart Search:** "Near Me" and category filtering.
*   **Offline Support:** Service Worker caching for deals and assets.

## Requirements

*   Node.js 18+ (tested with Node 20/22/24)
*   npm

## Environment configuration

Copy the example file and fill in real values. `.env` is **git-ignored** and must never be committed:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | Port the server listens on. Defaults to `3000`. |
| `SITE_URL` | yes | Public URL of the site (no trailing slash). Drives the **canonical link**, **`/sitemap.xml`** and **`/robots.txt`**. |
| `DATABASE_URL` | yes | SQLite connection string. Defaults to `file:./data/dealpass.db`. The path is resolved relative to `backend/prisma/schema.prisma`. |
| `JWT_SECRET` | yes | Long random string used to sign auth tokens. Generate with `openssl rand -hex 32`. |
| `GEMINI_API_KEY` | no | Optional. Leave empty to keep the paid Gemini integration disabled. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | no | Optional web-push keys. Leave empty to keep push disabled. |

Paid/third-party services are **off by default**: the Google AdSense script has been removed and the AI/push integrations only activate when their keys are provided.

## Local development

```bash
npm install
npm run dev
```

This starts Vite on `http://localhost:8080` (frontend, with `/api` proxied) and the Express API on `http://localhost:3000`.

## Production (single Node process)

Run these commands **from the project root**:

```bash
# 1. Install dependencies (dev deps are needed for the build + Prisma CLI)
npm ci

# 2. Create your environment file and edit it (set SITE_URL, JWT_SECRET, ...)
cp .env.example .env

# 3. Apply database migrations to the SQLite database
npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# 4. Build the frontend (Vite -> ./dist)
npm run build

# 5. Start the server (serves ./dist + /api on PORT, default 3000)
npm start
```

`npm start` runs the `prestart` hook (compiles the backend TypeScript to `backend/dist`) and then launches a single Node process via `node backend/dist/app.js`. No Vite dev server is used in production.

### Behind a reverse proxy (nginx, etc.)

Point the proxy at `http://127.0.0.1:3000` and set `SITE_URL` to the public `https://` URL so canonical links, `sitemap.xml` and `robots.txt` use the correct domain.

Example `systemd` unit:

```ini
[Unit]
Description=DealPass
After=network.target

[Service]
WorkingDirectory=/srv/dealpass
ExecStart=/usr/bin/node backend/dist/app.js
Environment=NODE_ENV=production
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

## npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server + nodemon backend. |
| `npm run build` | Build the frontend with Vite into `./dist`. |
| `npm run build:server` | Compile the backend TypeScript into `backend/dist`. |
| `npm start` | Compile the backend then run the production server. |
| `npm test` | Run the Vitest test suite. |
