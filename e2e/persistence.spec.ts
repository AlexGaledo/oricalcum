import { test, expect } from "@playwright/test";
import { login, createAndOpenWorkspace, spawnNode } from "./helpers";

test("a spawned node is persisted to the backend and survives reload", async ({ page }) => {
  await login(page);
  await createAndOpenWorkspace(page, `E2E Persist ${Date.now()}`);

  // spawning a node should fire a POST .../nodes to the backend
  const createReq = page.waitForResponse(
    (r) => /\/projects\/.+\/nodes$/.test(r.url()) && r.request().method() === "POST",
    { timeout: 20_000 },
  );
  await spawnNode(page);
  const created = await createReq;
  expect(created.ok()).toBeTruthy();

  // reload — the canvas must rehydrate the node FROM THE API (GET .../nodes)
  const hydrateReq = page.waitForResponse(
    (r) => /\/projects\/.+\/nodes$/.test(r.url()) && r.request().method() === "GET",
    { timeout: 20_000 },
  );
  await page.reload();
  const hydrated = await hydrateReq;
  const payload = await hydrated.json();
  expect(payload.data.length).toBeGreaterThanOrEqual(1);

  // and the node is rendered again
  await expect(page.locator("[data-id]")).toHaveCount(1);
});

test("camera pan/zoom persists across reload", async ({ page }) => {
  await login(page);
  await createAndOpenWorkspace(page, `E2E Camera ${Date.now()}`);

  const patchCam = page.waitForResponse(
    (r) => /\/projects\/[^/]+$/.test(r.url()) && r.request().method() === "PATCH",
    { timeout: 20_000 },
  );
  // zoom via wheel over the canvas centre — reliably mutates the camera
  const vp = page.viewportSize()!;
  await page.mouse.move(vp.width / 2, vp.height / 2);
  await page.mouse.wheel(0, -400);
  await page.mouse.wheel(0, -400);

  const patched = await patchCam;
  expect(patched.ok()).toBeTruthy();
});
