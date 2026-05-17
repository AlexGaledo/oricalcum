"use client";

import { useState } from "react";
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
