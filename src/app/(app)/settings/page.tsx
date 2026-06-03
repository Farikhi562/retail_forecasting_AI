import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const { user } = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Review account and deployment configuration for this Vercel-ready portfolio project."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-500">Signed in as</p>
              <p className="mt-1 font-semibold text-ink">{user.email}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">User ID</p>
              <p className="mt-1 break-all text-slate-700">{user.id}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
            <p>
              The app reads its public URL from{" "}
              <code className="rounded bg-mist px-1.5 py-0.5">
                NEXT_PUBLIC_APP_URL
              </code>
              , so it can move from localhost to a Vercel custom domain without
              hardcoding a hostname.
            </p>
            <p>
              Supabase Auth, PostgreSQL, Row Level Security, and JSON model
              inference are all compatible with Vercel serverless deployment.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
