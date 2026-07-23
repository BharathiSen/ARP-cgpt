-- Tier 3: store API key prefix for masked display (hashes stay in apiKey).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "apiKeyPrefix" TEXT;
