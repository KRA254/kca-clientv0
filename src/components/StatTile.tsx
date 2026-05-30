import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  hint,
  icon,
  alert = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  alert?: boolean;
}) {
  return (
    <div className="min-w-0 border-2 border-ink bg-card p-4">
      <div className="flex items-center gap-2 kicker mb-2">
        {icon}
        {label}
      </div>
      <div className={`font-mono text-xl sm:text-2xl font-bold metric-text ${alert ? "text-alert" : ""}`}>{value}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1 metric-text">{hint}</p>}
    </div>
  );
}
