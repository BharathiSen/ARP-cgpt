import { describe, expect, it } from "vitest";
import {
  assertSafeHttpUrl,
  isBlockedIpAddress,
  UnsafeUrlError,
} from "@/lib/urlSafety";

describe("urlSafety SSRF guards", () => {
  it("allows public https URLs", async () => {
    const href = await assertSafeHttpUrl("https://example.com/path");
    expect(href).toContain("https://example.com");
  });

  it("blocks non-http schemes", async () => {
    await expect(assertSafeHttpUrl("ftp://example.com")).rejects.toBeInstanceOf(
      UnsafeUrlError,
    );
    await expect(assertSafeHttpUrl("file:///etc/passwd")).rejects.toBeInstanceOf(
      UnsafeUrlError,
    );
  });

  it("blocks localhost and private IPs", async () => {
    await expect(assertSafeHttpUrl("http://localhost")).rejects.toBeInstanceOf(
      UnsafeUrlError,
    );
    await expect(assertSafeHttpUrl("http://127.0.0.1")).rejects.toBeInstanceOf(
      UnsafeUrlError,
    );
    await expect(assertSafeHttpUrl("http://10.0.0.5")).rejects.toBeInstanceOf(
      UnsafeUrlError,
    );
    await expect(
      assertSafeHttpUrl("http://192.168.1.10"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
    await expect(
      assertSafeHttpUrl("http://169.254.169.254/latest/meta-data/"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("blocks credentials in URLs", async () => {
    await expect(
      assertSafeHttpUrl("https://user:pass@example.com"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("classifies IP ranges correctly", () => {
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
    expect(isBlockedIpAddress("169.254.169.254")).toBe(true);
    expect(isBlockedIpAddress("::1")).toBe(true);
  });
});
