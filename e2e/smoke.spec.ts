import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing page loads with brand CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /start testing free/i })).toBeVisible();
  });

  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in|create account/i })).toBeVisible();
  });

  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("metrics endpoint requires auth", async ({ request }) => {
    const res = await request.get("/api/metrics/redis");
    expect(res.status()).toBe(401);
  });

  test("health endpoint stays public", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
