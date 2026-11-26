import path from 'path';

// A dedicated SQLite file for the backend test run so tests never touch the dev
// or production database. Resolved from the current working directory (the
// backend package when running vitest from ./backend).
export const TEST_DB_PATH = path.resolve(process.cwd(), '.test-data', 'test.db');
export const TEST_DB_URL = `file:${TEST_DB_PATH.replace(/\\/g, '/')}`;
