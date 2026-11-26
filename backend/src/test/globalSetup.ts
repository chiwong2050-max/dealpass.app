import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TEST_DB_PATH, TEST_DB_URL } from './dbPath';

const removeDb = () => {
  for (const file of [TEST_DB_PATH, `${TEST_DB_PATH}-journal`]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
};

// Runs once before the backend test suite: create a fresh SQLite database with
// the current Prisma schema, then tear it down afterwards.
export default function setup() {
  fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
  removeDb();

  const schemaCandidates = [
    path.resolve(process.cwd(), 'prisma', 'schema.prisma'),
    path.resolve(process.cwd(), 'backend', 'prisma', 'schema.prisma'),
  ];
  const schema = schemaCandidates.find((candidate) => fs.existsSync(candidate)) || schemaCandidates[0];

  execSync(`npx prisma db push --skip-generate --schema="${schema}"`, {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'inherit',
  });

  return () => removeDb();
}
