-- Tier 2: remove unused Job queue (probes run synchronously).
DROP TABLE IF EXISTS "Job";
