import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const BACKEND = "http://localhost:3001/api/v1";
export const CREDS_FILE = path.join(__dirname, ".auth", "account.json");

export interface Account {
  email: string;
  password: string;
  userId: string;
}

export function readAccount(): Account {
  return JSON.parse(fs.readFileSync(CREDS_FILE, "utf-8"));
}

/** Log in through the real /login UI; lands on /dashboard. */
export async function login(page: Page, acct = readAccount()): Promise<void> {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(acct.email);
  await page.locator('input[type="password"]').fill(acct.password);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
}

/** Create a workspace via the dashboard modal and open it. Returns its id. */
export async function createAndOpenWorkspace(page: Page, name: string): Promise<string> {
  await page.getByRole("button", { name: /New Workspace/i }).click();
  await page.locator('input[placeholder="Untitled workspace"]').fill(name);
  await page.getByRole("button", { name: /^Create$/ }).click();

  // open the card we just created — also wait for the canvas to hydrate from the
  // API (initial GET .../nodes). usePersistence suppresses writes while hydrating,
  // so interacting before this completes would silently drop the mutation.
  const hydrate = page.waitForResponse(
    (r) => /\/projects\/.+\/nodes$/.test(r.url()) && r.request().method() === "GET",
    { timeout: 30_000 },
  );
  await page.getByText(name, { exact: false }).first().click();
  await page.waitForURL("**/workspace**", { timeout: 20_000 });
  await expect(page.locator(".app")).toBeVisible();
  await hydrate;

  return await getActiveWorkspaceId(page);
}

/** Read the active workspace id out of the persisted zustand store. */
export async function getActiveWorkspaceId(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const raw = localStorage.getItem("oricalcum-workspaces");
    if (!raw) return "";
    return JSON.parse(raw)?.state?.activeId ?? "";
  });
}

/** Drag a shape pill from the toolbar onto the canvas to spawn a node. */
export async function spawnNode(page: Page): Promise<void> {
  const before = await page.locator("[data-id]").count();

  // open the node-kinds flyout
  await page.locator(".tool-btn", { hasText: "Nodes" }).click();
  const pill = page.locator(".shape-pill").first();
  await expect(pill).toBeVisible();

  // real drag: mousedown on pill, move to canvas centre, mouseup
  const box = await pill.boundingBox();
  if (!box) throw new Error("shape pill has no bounding box");
  const vp = page.viewportSize()!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(vp.width / 2, vp.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(page.locator("[data-id]")).toHaveCount(before + 1);

  // best-effort: if the node-kinds flyout is still open, close it so it can't
  // overlay later toolbar clicks. (Its post-drag state is non-deterministic.)
  if (await page.locator(".shape-flyout").isVisible().catch(() => false)) {
    await page.locator(".tool-btn", { hasText: "Nodes" }).click();
  }
}
