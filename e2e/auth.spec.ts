import { test, expect } from "@playwright/test";
import { login, readAccount } from "./helpers";

test("real Supabase login lands on the dashboard", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("button", { name: /New Workspace/i })).toBeVisible();
});

test("invalid credentials show an error and stay on /login", async ({ page }) => {
  const acct = readAccount();
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(acct.email);
  await page.locator('input[type="password"]').fill("definitely-wrong");
  await page.getByRole("button", { name: /^Sign in$/ }).click();

  // surfaced error; URL unchanged
  await expect(page.locator("text=/invalid|wrong|credential/i").first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated workspace access redirects to /login", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
});
