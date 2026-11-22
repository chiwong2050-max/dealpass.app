# 08. Deployment & DevOps

## 1. Containerization (Docker)
- Create `Dockerfile` for Backend and Frontend (or multi-stage build).
- Create `docker-compose.yml` for local dev (App + Postgres + Redis).

## 2. Hosting Strategy
- **Frontend:** Vercel or Netlify (Zero config, global CDN).
- **Backend:**
    - **PaaS:** Render, Railway, or Heroku (Easy).
    - **Cloud:** AWS EC2 or ECS (Control).
- **Database:** Managed Postgres (Supabase, Neon, AWS RDS).

## 3. Monitoring
- **Error Tracking:** Sentry (Frontend + Backend).
- **Uptime:** UptimeRobot or Pingdom.
- **Logs:** Papertrail or Datadog.

## 4. Environment Variables
- Ensure strictly separated `.env` for Development, Staging, and Production.
- Do not commit `.env` (add to `.gitignore` - checked, it is there).
