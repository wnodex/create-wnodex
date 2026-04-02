import '@dotenvx/dotenvx/config';

import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

// @ts-expect-error Prisma Client is generated after the build step, so it may not be available at compile time.
const prisma = new PrismaClient({ adapter });

export { prisma };
