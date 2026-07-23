import bcrypt from "bcryptjs";

/** Hash a password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Returns true only when the plain password matches the stored hash. */
export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/** Basic registration rules used by the API (easy to unit test). */
export function validateRegistrationInput(input: {
  email?: unknown;
  password?: unknown;
  name?: unknown;
}): { ok: true; email: string; password: string; name?: string } | { ok: false; error: string } {
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const name =
    typeof input.name === "string" && input.name.trim()
      ? input.name.trim()
      : undefined;

  if (!email || !password) {
    return { ok: false, error: "Missing email or password" };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "Invalid email address" };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  return { ok: true, email, password, name };
}
