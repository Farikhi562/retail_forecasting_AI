"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function ProtectedAppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-lg">
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-ink">
            Dashboard could not load
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The dashboard hit a server-side configuration or data error. Check
            the Vercel Function Logs for the matching digest, then confirm the
            Supabase environment variables are set for Production.
          </p>
          {error.digest ? (
            <p className="mt-3 rounded-md bg-mist px-3 py-2 text-xs text-slate-600">
              Digest: {error.digest}
            </p>
          ) : null}
          <Button type="button" className="mt-5" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
