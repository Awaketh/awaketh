import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './database/database';
import { captcha } from 'better-auth/plugins';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  plugins: [
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.CF_TURNSTILE_SECRET_KEY!,
    }),
  ],

  emailAndPassword: {
    enabled: true,
  },
});
