// Compatibility shim for tools that still look for sentry.client.config.ts.
// Canonical setup lives in instrumentation-client.ts.
import './instrumentation-client';

export { onRouterTransitionStart } from './instrumentation-client';
