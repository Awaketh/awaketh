// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

console.log('Instrumenting Sentry for client-sided monitoring...');

Sentry.init({
  dsn: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_WEB_SENTRY_DSN : '',
  spotlight: process.env.NODE_ENV !== 'production',
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error']}),
  ],

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.25 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  enableLogs: true,
  attachStacktrace: true,

  release: `awaketh-web@${process.env.NEXT_PUBLIC_APP_VERSION}`,
  environment: process.env.NODE_ENV,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

console.log('Sentry client instrumented!');
