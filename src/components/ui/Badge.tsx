import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { StockoutRisk } from "@/types/database";

const riskStyles: Record<StockoutRisk, string> = {
  low: "bg-teal-50 text-teal-700 ring-teal-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  high: "bg-red-50 text-red-700 ring-red-100"
};

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        className
      )}
      {...props}
    />
  );
}

export function RiskBadge({ risk }: { risk: StockoutRisk }) {
  return <Badge className={riskStyles[risk]}>{risk.toUpperCase()}</Badge>;
}
