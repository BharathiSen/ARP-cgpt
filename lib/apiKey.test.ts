import { describe, expect, it } from "vitest";
import { formatMaskedApiKey, hashApiKey } from "@/lib/apiKey";

describe("apiKey hashing", () => {
  it("hashes deterministically", () => {
    const a = hashApiKey("arp_testkey");
    const b = hashApiKey("arp_testkey");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(a).not.toContain("arp_");
  });

  it("masks using prefix only", () => {
    expect(formatMaskedApiKey("arp_abcdef12")).toBe(
      `arp_abcdef12${"*".repeat(20)}`,
    );
    expect(formatMaskedApiKey(null)).toBeNull();
  });
});
