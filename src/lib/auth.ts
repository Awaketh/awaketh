import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './database/database';
import { captcha, oneTap } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    oneTap(),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.CF_TURNSTILE_SECRET_KEY!,
    }),
    passkey({
      registration: {
        requireSession: false,
        // Optional server-defined extensions
        extensions: { credProps: true },
      },
      authentication: {
        // Optional server-defined extensions
        extensions: { credProps: true },
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
  },
});
