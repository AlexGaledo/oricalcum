"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Surface an error bounced back from the OAuth callback (?error=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error_description") ?? params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, []);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      // On success the browser is redirected to Google — this page unmounts.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg("Check your email to confirm your account.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0b0c0e" }}>
      <div
        className="w-full max-w-sm p-8 flex flex-col gap-6"
        style={{
          background: "#111316",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
        }}
      >
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: "11.5px",
              letterSpacing: "0.12em",
              color: "var(--accent, #10A37F)",
              textTransform: "uppercase",
            }}
          >
            oricalcum
          </span>
          <h1
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: "16px",
              color: "#e7e9ec",
              fontWeight: 500,
            }}
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "#16191d",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "7px",
            padding: "10px",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: "12px",
            color: "#e7e9ec",
            cursor: googleLoading ? "not-allowed" : "pointer",
            opacity: googleLoading ? 0.6 : 1,
            transition: "border-color 120ms ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "10px", letterSpacing: "0.08em", color: "rgba(231,233,236,0.35)", textTransform: "uppercase" }}>or</span>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "10px",
                letterSpacing: "0.08em",
                color: "rgba(231,233,236,0.6)",
                textTransform: "uppercase",
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: "#16191d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "7px",
                padding: "10px 12px",
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "12px",
                color: "#e7e9ec",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent, #10A37F)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "10px",
                letterSpacing: "0.08em",
                color: "rgba(231,233,236,0.6)",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "#16191d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "7px",
                padding: "10px 12px",
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "12px",
                color: "#e7e9ec",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent, #10A37F)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "11px",
                color: "#ef4444",
              }}
            >
              {error}
            </p>
          )}

          {successMsg && (
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: "11px",
                color: "var(--accent, #10A37F)",
              }}
            >
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent, #10A37F)",
              color: "#0b0c0e",
              border: "none",
              borderRadius: "7px",
              padding: "10px",
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 120ms ease",
            }}
          >
            {loading ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setSuccessMsg(null);
          }}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: "11px",
            color: "rgba(231,233,236,0.4)",
            cursor: "pointer",
            textAlign: "center",
            transition: "color 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(231,233,236,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(231,233,236,0.4)";
          }}
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
