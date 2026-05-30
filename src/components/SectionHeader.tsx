import { ReactNode } from "react";

export function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b-2 border-ink pb-3 mb-6">
      <div className="min-w-0">
        {kicker && <div className="kicker text-alert mb-2">{kicker}</div>}
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{title}</h2>
      </div>
      {action && <div className="shrink-0 max-w-full">{action}</div>}
    </div>
  );
}
