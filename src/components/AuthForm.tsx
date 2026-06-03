"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getAuthMessage(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return "Email atau password salah. Pastikan akun sudah terdaftar dan password benar.";
    }

    if (normalized.includes("email not confirmed")) {
      return "Email belum dikonfirmasi. Cek inbox email, atau nonaktifkan Confirm email di Supabase untuk testing portfolio.";
    }

    if (normalized.includes("user already registered")) {
      return "Email ini sudah terdaftar. Silakan login memakai akun tersebut.";
    }

    return message;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/dashboard`;

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectTo,
              data: {
                full_name: fullName,
                business_name: businessName
              }
            }
          });

    setLoading(false);

    if (result.error) {
      setError(getAuthMessage(result.error.message));
      return;
    }

    if (mode === "register" && !result.data.session) {
      setNotice(
        "Registrasi berhasil. Supabase meminta konfirmasi email sebelum login. Cek inbox email atau matikan Confirm email di Supabase untuk mode demo."
      );
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom");
    router.push(redirectedFrom ?? "/dashboard");
    router.refresh();
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Retail Forecast AI
            </p>
            <h1 className="text-xl font-bold text-ink">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Full name
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="focus-ring mt-1 h-11 w-full rounded-md border border-line px-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Business name
                </span>
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="focus-ring mt-1 h-11 w-full rounded-md border border-line px-3"
                  required
                />
              </label>
            </>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-1 h-11 w-full rounded-md border border-line px-3"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-1 h-11 w-full rounded-md border border-line px-3"
              minLength={6}
              required
            />
          </label>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {notice ? (
            <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-800">
              {notice}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Working..." : isLogin ? "Log in" : "Register"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isLogin ? "Need an account?" : "Already registered?"}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-semibold text-teal-700 hover:text-teal-600"
          >
            {isLogin ? "Create one" : "Log in"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
