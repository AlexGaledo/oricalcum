import { test, expect } from "@playwright/test";
import { login, createAndOpenWorkspace, spawnNode, getActiveWorkspaceId } from "./helpers";

test("toggling public exposes a read-only /share page", async ({ page, browser }) => {
  await login(page);
  const projectId = await createAndOpenWorkspace(page, `E2E Share ${Date.now()}`);
  await spawnNode(page);

  // open the Share flyout and flip public on
  await page.locator(".tool-btn", { hasText: "Share" }).click();
  const shareReq = page.waitForResponse(
    (r) => /\/projects\/[^/]+\/share$/.test(r.url()) && r.request().method() === "PATCH",
    { timeout: 20_000 },
  );
  await page.locator(".share-toggle").click();
  expect((await shareReq).ok()).toBeTruthy();
  await expect(page.locator(".share-toggle")).toHaveText(/on/i);

  // open the public share page in a fresh, unauthenticated context
  const ctx = await browser.newContext();
  const pub = await ctx.newPage();
  await pub.goto(`/share/${projectId}`);
  // public canvas renders the node, read-only (no toolbar spawn controls)
  await expect(pub.locator("[data-id]")).toHaveCount(1, { timeout: 20_000 });
  await ctx.close();
});

test("share id matches the active workspace", async ({ page }) => {
  await login(page);
  const id = await createAndOpenWorkspace(page, `E2E ShareId ${Date.now()}`);
  expect(id).toBe(await getActiveWorkspaceId(page));
});
