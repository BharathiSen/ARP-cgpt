import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0';

const sentryBaseOptions = {
  dsn,
  tracesSampleRate: 1.0,
  debug: false,
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(sentryBaseOptions);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryBaseOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
