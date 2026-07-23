import { afterEach, describe, expect, it } from "vitest";
import { isConfiguredAdminEmail } from "@/lib/adminEmails";
import {
  hashPassword,
  validateRegistrationInput,
  verifyPassword,
} from "@/lib/passwords";

describe("admin email allowlist", () => {
  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAILS;
  });

  it("returns false when no admin env is set", () => {
    expect(isConfiguredAdminEmail("you@example.com")).toBe(false);
  });

  it("matches ADMIN_EMAIL case-insensitively", () => {
    process.env.ADMIN_EMAIL = "You@Example.com";
    expect(isConfiguredAdminEmail("you@example.com")).toBe(true);
  });

  it("supports comma-separated ADMIN_EMAILS", () => {
    process.env.ADMIN_EMAILS = "a@x.com, b@y.com";
    expect(isConfiguredAdminEmail("b@y.com")).toBe(true);
    expect(isConfiguredAdminEmail("c@z.com")).toBe(false);
  });
});

describe("password + registration validation", () => {
  it("rejects short passwords", () => {
    const result = validateRegistrationInput({
      email: "dev@example.com",
      password: "short",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts valid registration input", () => {
    const result = validateRegistrationInput({
      email: " Dev@Example.com ",
      password: "longenough",
      name: "Dev",
    });
    expect(result).toEqual({
      ok: true,
      email: "dev@example.com",
      password: "longenough",
      name: "Dev",
    });
  });

  it("verifyPassword rejects the wrong password", async () => {
    const hash = await hashPassword("correct-horse");
    await expect(verifyPassword("correct-horse", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
