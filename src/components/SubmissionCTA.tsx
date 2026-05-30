import { Link } from "@tanstack/react-router";
import { ShieldAlert, UploadCloud } from "lucide-react";

export function SubmissionCTA({
  compact = false,
  title = "Have evidence of corruption?",
}: {
  compact?: boolean;
  title?: string;
}) {
  return (
    <div className={`border-2 border-ink bg-card ${compact ? "p-4" : "p-5 md:p-6"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <div className="w-10 h-10 bg-alert text-primary-foreground grid place-items-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-xl font-semibold leading-tight">{title}</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Submit a corruption case, stalled project, document link, or image. Use an anonymous name or let the system generate one.
            </p>
            <p className="kicker mt-2">Submissions stay private until reviewed.</p>
          </div>
        </div>
        <Link
          to="/submit"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-ink text-primary-foreground px-4 py-3 font-mono text-xs uppercase tracking-wider hover:bg-alert transition-colors sm:shrink-0"
        >
          <UploadCloud className="w-4 h-4" /> Submit a tip
        </Link>
      </div>
    </div>
  );
}
