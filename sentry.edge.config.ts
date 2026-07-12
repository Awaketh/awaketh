// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

console.log('Instrumenting Sentry for edge monitoring...');

Sentry.init({
  dsn: process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SENTRY_DSN : '',
  spotlight: process.env.NODE_ENV !== "production",
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error']}),
  ],

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.25 : 0,

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

console.log('Sentry edge instrumented!');
