import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project-root .env file.
// This file resolves to backend/src/config (dev) or backend/dist/config (build),
// so the project root is three levels up.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const port = Number(process.env.PORT) || 3000;
// Bind to 127.0.0.1 by default; a reverse proxy (nginx) forwards public traffic.
// Set HOST=0.0.0.0 only if you intentionally want to expose the app directly.
const host = process.env.HOST || '127.0.0.1';

export const config = {
  port,
  host,
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  // Public site URL used for canonical links, sitemap.xml and robots.txt.
  siteUrl: process.env.SITE_URL || `http://localhost:${port}`,
};

// Validate essential environment variables
if (!config.jwtSecret) {
  console.error('ERROR: JWT_SECRET is not set in .env file. This is a critical security requirement.');
  process.exit(1);
}
if (!config.databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set in .env file.');
  process.exit(1);
}
