import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import { oneTapClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      autoSelect: true,
      context: 'signin',
      additionalOptions: {},
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 5,
      },
    }),
    passkeyClient(),
  ],
});
