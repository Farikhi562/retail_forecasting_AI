import { NextResponse } from "next/server";

export function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL)
  };

  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ok,
      checks,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null
    },
    { status: ok ? 200 : 500 }
  );
}
