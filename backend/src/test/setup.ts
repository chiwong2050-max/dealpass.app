import { TEST_DB_URL } from './dbPath';

// Point the app at an isolated test database with safe defaults. These are set
// before any test file imports the app (and before dotenv runs), so the dev
// .env is never used during tests.
process.env.DATABASE_URL = TEST_DB_URL;
process.env.JWT_SECRET = 'test-secret';
process.env.SITE_URL = 'https://dealpass.test';
// Public pages must stay out of search results in this pass; tests assert this.
process.env.PUBLIC_PAGES_INDEXING = 'false';
