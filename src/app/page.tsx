import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  BrainCircuit,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const features = [
  {
    title: "Demand forecasting",
    description:
      "Predict the next 7 days of sales using a transparent regression model trained from realistic retail data.",
    icon: BrainCircuit
  },
  {
    title: "Inventory risk",
    description:
      "Spot low stock and high stockout risk before customers see empty shelves.",
    icon: Boxes
  },
  {
    title: "Sales visibility",
    description:
      "Track daily sales, revenue, product velocity, and restock recommendations in one dashboard.",
    icon: TrendingUp
  },
  {
    title: "Vercel-ready stack",
    description:
      "Next.js Route Handlers run inference from JSON artifacts without a separate Python service.",
    icon: ShieldCheck
  }
];

export default function LandingPage() {
  return (
    <main className="bg-mist text-ink">
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.22),transparent_45%,rgba(255,255,255,0.08))]" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-sm font-medium text-teal-100"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Retail Forecast AI
            </Link>
            <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Retail Forecast AI
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold text-teal-100">
              Predict demand. Prevent stockouts. Manage smarter.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              A full-stack machine learning web app for small retail businesses
              to track products, daily sales, inventory levels, and future
              product demand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" size="lg">
                Open Dashboard
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="secondary">
                Sign in
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/95 p-4 shadow-soft">
            <div className="rounded-md border border-line bg-white p-4 text-ink">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Forecast summary
                  </p>
                  <p className="mt-1 text-2xl font-bold">Next 7 days</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                  Live model
                </span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["Predicted units", "186"],
                  ["Stockout risk", "Medium"],
                  ["Restock", "72"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md bg-mist p-3">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-44 rounded-md bg-[linear-gradient(180deg,#ecfeff,#ffffff)] p-4">
                <div className="flex h-full items-end gap-2">
                  {[35, 50, 42, 66, 60, 78, 86, 72, 96, 88].map((height, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t bg-teal-500"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-line bg-white p-5"
              >
                <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
