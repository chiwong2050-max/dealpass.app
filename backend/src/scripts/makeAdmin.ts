/**
 * Promotes an existing user to ADMIN.
 *
 * Usage (from the project root):
 *   npm run make-admin -- user@example.com
 *
 * The user must already exist in the database (i.e. they have signed up).
 */
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load the project-root .env (this file lives in backend/src/scripts).
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const email = process.argv[2];

const main = async () => {
  if (!email) {
    console.error('Usage: npm run make-admin -- user@example.com');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      console.error('The user must sign up first before they can be promoted.');
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`${email} is already an ADMIN. Nothing to do.`);
      return;
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`Success: ${updated.email} is now an ADMIN.`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((err) => {
  console.error('Failed to promote user:', err);
  process.exit(1);
});
