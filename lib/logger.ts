export const logApiRequest = async (data: any) => {
  // Can be plugged into Sentry/Upstash/BetterStack in the future
  console.log("Telemetry Event:", data);
};

