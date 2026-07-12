// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

console.log('Instrumenting Sentry for server-sided monitoring...');

Sentry.init({
  dsn: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_WEB_SENTRY_DSN : '',
  spotlight: process.env.NODE_ENV !== 'production',
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error']}),
  ],

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.25 : 1.0,

  enableLogs: true,
  attachStacktrace: true,

  release: `awaketh-web@${process.env.NEXT_PUBLIC_APP_VERSION}`,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

console.log('Sentry server instrumented!');
