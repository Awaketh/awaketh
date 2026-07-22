// Prisma CLI config. Prisma 7 does not auto-load .env, so we load it here.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { buildConnectionString } from './src/lib/database/connection-string';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma 7 keeps the connection URL out of schema.prisma; the CLI/Migrate reads it here.
    url: buildConnectionString(),
  },
});
