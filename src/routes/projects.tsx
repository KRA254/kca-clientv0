import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, type StalledProject } from "@/lib/api";
import { formatMoney, labelize } from "@/lib/utils";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { SubmissionCTA } from "@/components/SubmissionCTA";
import { Building2, CalendarClock, ExternalLink, HardHat } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { AskArchiveAI } from "@/components/AskArchiveAI";

export const Route = createFileRoute("/projects")({
  component: Projects,
  head: () => ({
    meta: [
      { title: "Stalled Projects - Kenya Corruption Archives" },
      { name: "description", content: "Public projects stalled, delayed, or abandoned after corruption-linked cases." },
    ],
  }),
});

const statusOptions: Array<StalledProject["status"] | "all"> = ["all", "stalled", "delayed", "abandoned", "under_review"];

function Projects() {
  const [status, setStatus] = useState<StalledProject["status"] | "all">("all");
  const { data: analytics } = useQuery({
    queryKey: ["analytics", "projects"],
    queryFn: api.projectAnalytics,
  });
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", "stalled", status],
    queryFn: () => api.stalledProjects({ status: status === "all" ? undefined : status, limit: 100 }),
  });

  const sectors = useMemo(() => analytics?.bySector?.filter((item) => item._id) ?? [], [analytics]);
  const totals = analytics?.totals?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader kicker="Public Projects" title="Stalled by corruption" />
      <div className="mb-8">
        <SubmissionCTA compact title="Know a stalled or failed public project?" />
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="border-2 border-ink bg-card p-4">
          <div className="kicker mb-2">Budgeted</div>
          <div className="font-mono text-xl sm:text-2xl font-bold metric-text">
            {formatMoney(totals?.budgetedAmount, String(totals?._id ?? "KES"))}
          </div>
        </div>
        <div className="border-2 border-ink bg-card p-4">
          <div className="kicker mb-2">Paid Out</div>
          <div className="font-mono text-xl sm:text-2xl font-bold metric-text">
            {formatMoney(totals?.amountPaid, String(totals?._id ?? "KES"))}
          </div>
        </div>
        <div className="border-2 border-ink bg-card p-4">
          <div className="kicker mb-2">Estimated Exposure</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-alert metric-text">
            {formatMoney(totals?.estimatedLoss, String(totals?._id ?? "KES"))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-8">
        {statusOptions.map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border hairline transition-colors ${
              status === item ? "bg-ink text-primary-foreground border-ink" : "hover:border-ink"
            }`}
          >
            {labelize(item)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8">
          {isLoading ? <SkeletonList count={4} variant="card" /> :
            projects.length === 0 ? <EmptyState title="No stalled projects match" hint="Try another status filter." /> :
            <div className="space-y-4">
              {projects.map((project) => <ProjectRecord key={project.id} project={project} />)}
            </div>}
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <div>
            <SectionHeader kicker="Sectors" title="Where projects stall" />
            <div className="border hairline bg-card divide-y hairline">
              {sectors.map((sector) => (
                <div key={String(sector._id)} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <div className="font-display font-semibold">{labelize(sector._id)}</div>
                    <div className="kicker">{sector.count} projects</div>
                  </div>
                  <div className="font-mono text-xs text-alert sm:text-right metric-text">
                    {formatMoney(sector.estimatedLoss, "KES")}
                  </div>
                </div>
              ))}
              {sectors.length === 0 && <EmptyState title="No sector data" />}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProjectRecord({ project }: { project: StalledProject }) {
  return (
    <article className="border-2 border-ink bg-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="kicker text-alert">{[project.county, project.sector].filter(Boolean).join(" / ")}</div>
          <h2 className="font-display text-2xl font-semibold leading-tight mt-1">{project.name}</h2>
        </div>
        <StatusBadge value={project.status}>{labelize(project.status)}</StatusBadge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mt-3">{project.description}</p>

      <div className="grid gap-3 sm:grid-cols-3 mt-4">
        <Metric label="Budget" value={formatMoney(project.budgetedAmount, project.currency)} />
        <Metric label="Paid" value={formatMoney(project.amountPaid, project.currency)} />
        <Metric label="Exposure" value={formatMoney(project.estimatedLoss, project.currency)} alert />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mt-4 text-sm">
        <div className="flex items-start gap-2 min-w-0"><HardHat className="w-4 h-4 text-alert shrink-0 mt-0.5" /> <span className="break-words">{project.contractor || "Contractor not listed"}</span></div>
        <div className="flex items-start gap-2 min-w-0"><Building2 className="w-4 h-4 text-alert shrink-0 mt-0.5" /> <span className="break-words">{project.county || "National"}</span></div>
        <div className="flex items-start gap-2 min-w-0"><CalendarClock className="w-4 h-4 text-alert shrink-0 mt-0.5" /> <span className="break-words">{project.lastVerifiedAt ? new Date(project.lastVerifiedAt).toLocaleDateString() : "Verification pending"}</span></div>
      </div>

      {!!project.sources?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.sources.slice(0, 3).map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase border hairline px-2 py-1 hover:border-ink"
            >
              {source.type ?? "Source"} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link
          to="/project/$slug"
          params={{ slug: project.slug }}
          className="inline-flex items-center justify-center border-2 border-ink bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider"
        >
          View details
        </Link>
      </div>

      <div className="mt-4">
        <AskArchiveAI
          compact
          target={{ type: "project", slug: project.slug }}
          title="Ask about this project"
          suggestions={[
            "Why is this project listed here?",
            "Who is responsible and what money is exposed?",
            "Check for recent public-source updates.",
          ]}
        />
      </div>
    </article>
  );
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="border hairline p-3">
      <div className="kicker">{label}</div>
      <div className={`font-mono text-base sm:text-lg font-bold metric-text ${alert ? "text-alert" : ""}`}>{value}</div>
    </div>
  );
}
