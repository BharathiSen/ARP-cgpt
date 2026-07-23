/** Admin emails from ADMIN_EMAILS / ADMIN_EMAIL (comma-separated). */
export function isConfiguredAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  const allowed = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
