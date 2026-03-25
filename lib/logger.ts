type TelemetryEvent = Record<string, unknown>;

export const logApiRequest = async (data: TelemetryEvent) => {
  // Can be plugged into Sentry/Upstash/BetterStack in the future
  console.log("Telemetry Event:", data);
};

