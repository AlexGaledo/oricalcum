import fs from "node:fs";
import path from "node:path";
import { BACKEND, CREDS_FILE, type Account } from "./helpers";

/** Minimal .env parser for the backend's service key (admin user deletion). */
function readBackendEnv(): Record<string, string> {
  const p = path.join(__dirname, "..", "..", "oricalcum-api", ".env");
  const out: Record<string, string> = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(CREDS_FILE)) return;
  const acct: Account = JSON.parse(fs.readFileSync(CREDS_FILE, "utf-8"));

  // 1. delete the projects this account created (cascades to children)
  try {
    const login = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: acct.email, password: acct.password }),
    });
    const token = (await login.json())?.data?.access_token;
    if (token) {
      const auth = { Authorization: `Bearer ${token}` };
      const list = await (await fetch(`${BACKEND}/projects`, { headers: auth })).json();
      for (const p of list?.data ?? []) {
        await fetch(`${BACKEND}/projects/${p.id}`, { method: "DELETE", headers: auth });
      }
    }
  } catch (e) {
    console.warn("[e2e] project cleanup failed:", e);
  }

  // 2. delete the Supabase auth user via the admin REST API (service key)
  try {
    const env = readBackendEnv();
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_KEY;
    if (url && key && acct.userId) {
      await fetch(`${url}/auth/v1/admin/users/${acct.userId}`, {
        method: "DELETE",
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
    }
  } catch (e) {
    console.warn("[e2e] account cleanup failed:", e);
  }

  try {
    fs.rmSync(CREDS_FILE);
  } catch {
    /* ignore */
  }
}
