import crypto from "crypto";
import prisma from "./prisma";

/** SHA-256 hex digest of an API key (stored in User.apiKey). */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/** Display-only mask using stored prefix (never returns the full secret). */
export function formatMaskedApiKey(prefix: string | null | undefined): string | null {
  if (!prefix) return null;
  return `${prefix}${"*".repeat(20)}`;
}

/**
 * Create a new API key for the user.
 * Returns the plaintext key ONCE — only the hash + prefix are persisted.
 */
export async function createApiKey(userId: string, keyName?: string) {
  void keyName;
  const token = crypto.randomBytes(32).toString("hex");
  const key = `arp_${token}`;
  const apiKeyHash = hashApiKey(key);
  const apiKeyPrefix = key.slice(0, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      apiKey: apiKeyHash,
      apiKeyPrefix,
    },
  });

  return { key, prefix: apiKeyPrefix };
}

/**
 * Resolve a Bearer token to a user.
 * Supports hashed keys; also upgrades legacy plaintext rows on first use.
 */
export async function findUserByApiKey(rawKey: string) {
  if (!rawKey || typeof rawKey !== "string") return null;

  const hashed = hashApiKey(rawKey);

  const byHash = await prisma.user.findUnique({
    where: { apiKey: hashed },
  });
  if (byHash) return byHash;

  // Legacy: older rows stored plaintext arp_… keys.
  if (rawKey.startsWith("arp_")) {
    const legacy = await prisma.user.findUnique({
      where: { apiKey: rawKey },
    });
    if (legacy) {
      await prisma.user.update({
        where: { id: legacy.id },
        data: {
          apiKey: hashed,
          apiKeyPrefix: rawKey.slice(0, 12),
        },
      });
      return { ...legacy, apiKey: hashed, apiKeyPrefix: rawKey.slice(0, 12) };
    }
  }

  return null;
}
