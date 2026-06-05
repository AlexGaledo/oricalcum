import fs from "node:fs";
import path from "node:path";
import { BACKEND, CREDS_FILE, type Account } from "./helpers";

/**
 * Mint a real Supabase account via the backend's POST /auth/signup. Waits for
 * the backend to be reachable first, so this is robust regardless of whether
 * Playwright starts it before or after globalSetup.
 */
async function waitForBackend(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch("http://localhost:3001/health");
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 1000));
  }
  throw new Error("Backend never became reachable on :3001");
}

export default async function globalSetup(): Promise<void> {
  await waitForBackend();

  const email = `test+e2e${Date.now().toString(36)}@oricalcum.test`;
  const password = "Test-Passw0rd!42";

  const resp = await fetch(`${BACKEND}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) {
    throw new Error(`signup failed: ${resp.status} ${await resp.text()}`);
  }
  const userId = (await resp.json())?.data?.id as string;

  const account: Account = { email, password, userId };
  fs.mkdirSync(path.dirname(CREDS_FILE), { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify(account, null, 2));
  console.log(`[e2e] created test account ${email}`);
}
