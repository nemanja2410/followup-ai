"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm({
  initialSignUp,
  authError,
}: {
  initialSignUp: boolean;
  authError?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError ? "Could not complete sign-in. Try again." : null
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      setMessage(
        error ? error.message : "If that account exists, check your email for a reset link."
      );
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Account created. Check your email to confirm, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F1EC] p-4 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <Link href="/" className="block text-center text-sm font-semibold tracking-tight">
          FollowUp AI
        </Link>
        <p className="mt-2 text-center text-sm text-zinc-500">
          {isForgot
            ? "Reset your password"
            : isSignUp
              ? "Create an account to follow up on Jobber quotes"
              : "Sign in to your dashboard"}
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-[#F3F1EC] p-3 text-center text-xs text-zinc-600">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
              placeholder="you@domain.com"
            />
          </div>
          {!isForgot ? (
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
                placeholder="••••••••"
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Please wait…" : isForgot ? "Send reset link" : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          {!isSignUp && !isForgot ? (
            <button
              type="button"
              onClick={() => {
                setIsForgot(true);
                setMessage(null);
              }}
              className="block w-full text-xs text-zinc-500 hover:text-zinc-900"
            >
              Forgot password?
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isForgot) {
                setIsForgot(false);
                setIsSignUp(false);
              } else {
                setIsSignUp(!isSignUp);
              }
              setMessage(null);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            {isForgot
              ? "Back to sign in"
              : isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
