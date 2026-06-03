import { test, expect } from "@playwright/test";
import { login, createAndOpenWorkspace, spawnNode } from "./helpers";

test("capture creates a snapshot that lists in the history panel", async ({ page }) => {
  await login(page);
  await createAndOpenWorkspace(page, `E2E Snap ${Date.now()}`);
  await spawnNode(page);

  // open the history flyout
  await page.locator(".snapshots-root button", { hasText: "history" }).click();
  await expect(page.locator(".snapshots-flyout")).toBeVisible();

  const createReq = page.waitForResponse(
    (r) => /\/snapshots$/.test(r.url()) && r.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.locator(".snapshots-capture-btn").click();
  const created = await createReq;
  expect(created.ok()).toBeTruthy();

  await expect(page.locator(".snapshots-item")).toHaveCount(1);
});
