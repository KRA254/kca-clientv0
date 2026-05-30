import { CheckCircle2, Clock3, Eye, ShieldCheck } from "lucide-react";
import type React from "react";
import { labelize } from "@/lib/utils";

const badgeTone = (value?: string) => {
  const key = (value ?? "").toLowerCase();
  if (["verified", "published", "approved", "completed"].includes(key)) return "bg-ink text-primary-foreground border-ink";
  if (["stalled", "delayed", "abandoned", "failed", "rejected"].includes(key)) return "bg-alert text-alert-foreground border-alert";
  if (["under_review", "pending", "submitted", "in_progress"].includes(key)) return "bg-amber/30 text-foreground border-amber/50";
  return "bg-card text-foreground border-hairline";
};

const badgeIcon = (value?: string) => {
  const key = (value ?? "").toLowerCase();
  if (key === "verified" || key === "published" || key === "approved") return <ShieldCheck className="w-3 h-3" />;
  if (key === "completed") return <CheckCircle2 className="w-3 h-3" />;
  if (key === "views") return <Eye className="w-3 h-3" />;
  if (key === "pending" || key === "under_review" || key === "submitted") return <Clock3 className="w-3 h-3" />;
  return null;
};

export function StatusBadge({ value, children }: { value?: string; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-wider ${badgeTone(value)}`}>
      {badgeIcon(value)}
      <span className="truncate">{children ?? labelize(value)}</span>
    </span>
  );
}
