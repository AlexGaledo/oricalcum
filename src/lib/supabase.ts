import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

let client: SupabaseClient | null = null;

const DEMO_SESSION = {
  access_token: "demo-access-token",
  token_type: "bearer",
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  refresh_token: "demo-refresh-token",
  user: {
    id: "demo-user-id",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    role: "authenticated",
    email: "demo@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  },
};

function createDemoClient(): SupabaseClient {
  const auth = {
    getSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: DEMO_SESSION.user, session: DEMO_SESSION },
      error: null,
    }),
    signUp: async () => ({
      data: { user: DEMO_SESSION.user, session: DEMO_SESSION },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    refreshSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    setSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    updateUser: async () => ({ data: { user: DEMO_SESSION.user }, error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
  };
  return { auth } as unknown as SupabaseClient;
}

export function getSupabase(): SupabaseClient {
  if (IS_DEMO) return createDemoClient();
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  client = createClient(url, key);
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});
