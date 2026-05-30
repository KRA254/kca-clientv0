import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney, labelize } from "@/lib/utils";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { StatusBadge } from "@/components/StatusBadge";
import { AskArchiveAI } from "@/components/AskArchiveAI";
import {
  Banknote,
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  HardHat,
  MapPin,
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/project/$slug")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", "stalled", slug],
    queryFn: () => api.stalledProject(slug),
  });

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-10"><SkeletonList count={4} /></div>;
  }

  if (!project) {
    return <div className="max-w-4xl mx-auto p-10"><EmptyState title="Project not found" /></div>;
  }

  const dates = [
    { label: "Started", value: project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not listed" },
    {
      label: "Expected completion",
      value: project.expectedCompletionDate ? new Date(project.expectedCompletionDate).toLocaleDateString() : "Not listed",
    },
    {
      label: "Last verified",
      value: project.lastVerifiedAt ? new Date(project.lastVerifiedAt).toLocaleDateString() : "Verification pending",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="mb-6">
        <Link to="/projects" className="font-mono text-xs uppercase hover:text-alert">Back to projects</Link>
      </div>

      <section className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 min-w-0">
          <div className="kicker text-alert mb-3">{[project.county, project.sector].filter(Boolean).join(" / ") || "Public project"}</div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.08] break-words">{project.name}</h1>
            <StatusBadge value={project.status}>{labelize(project.status)}</StatusBadge>
          </div>

          {project.imageUrl && (
            <div className="aspect-[16/9] overflow-hidden bg-muted border-2 border-ink mb-8">
              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
            </div>
          )}

          <section className="grid sm:grid-cols-3 gap-3 mb-8">
            <MoneyTile label="Budgeted" value={formatMoney(project.budgetedAmount, project.currency)} />
            <MoneyTile label="Paid" value={formatMoney(project.amountPaid, project.currency)} />
            <MoneyTile label="Estimated exposure" value={formatMoney(project.estimatedLoss, project.currency)} alert />
          </section>

          <div className="mb-10">
            <AskArchiveAI
              target={{ type: "project", slug: project.slug }}
              title="Ask about this project"
              suggestions={[
                "Summarize why this project is listed here.",
                "Who is responsible and what money is exposed?",
                "Check for recent public-source updates.",
              ]}
            />
          </div>

          <SectionHeader kicker="Project Record" title="Description" />
          <div className="prose-article max-w-none mb-10">
            <p>{project.description || "No short description has been published for this project."}</p>
            {project.details && <p>{project.details}</p>}
          </div>

          <SectionHeader kicker="Delivery" title="Contract and responsibility" />
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            <InfoTile icon={<HardHat />} label="Contractor" value={project.contractor || "Not listed"} />
            <InfoTile icon={<Building2 />} label="Tender awarded to" value={project.tenderAwardedTo || "Not listed"} />
            <InfoTile icon={<UserRound />} label="Responsible person" value={project.personResponsibleName || "Not listed"} />
            <InfoTile icon={<FileText />} label="Procurement method" value={project.procurementMethod || "Not listed"} />
            <InfoTile icon={<Banknote />} label="Funding source" value={project.fundingSource || "Not listed"} />
            <InfoTile icon={<MapPin />} label="County" value={project.county || "National / not listed"} />
          </div>

          <SectionHeader kicker="Timeline" title="Dates" />
          <div className="grid sm:grid-cols-3 gap-3 mb-10">
            {dates.map((item) => (
              <InfoTile key={item.label} icon={<CalendarClock />} label={item.label} value={item.value} />
            ))}
          </div>

          <SectionHeader kicker="Evidence" title="Sources" />
          <div className="space-y-2">
            {(project.sources ?? []).map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-3 border hairline bg-card p-3 hover:border-ink"
              >
                <span className="min-w-0">
                  <span className="kicker">{source.type ?? "Source"}</span>
                  <span className="block font-display font-semibold break-words">{source.title}</span>
                  {source.description && <span className="block text-xs text-muted-foreground mt-1 break-words">{source.description}</span>}
                </span>
                <ExternalLink className="w-4 h-4 shrink-0 mt-1 text-alert" />
              </a>
            ))}
            {(project.sources ?? []).length === 0 && <EmptyState title="No sources published yet" />}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="border-2 border-ink bg-card p-4">
            <div className="kicker text-alert mb-1">Progress</div>
            <div className="font-display text-2xl font-semibold mb-3">
              {project.completionPercent ?? 0}% complete
            </div>
            <div className="h-2 bg-muted border hairline overflow-hidden">
              <div
                className="h-full bg-alert"
                style={{ width: `${Math.max(0, Math.min(100, project.completionPercent ?? 0))}%` }}
              />
            </div>
          </div>

          <div className="border hairline bg-card p-4 space-y-3">
            <div className="kicker text-alert">Record fields</div>
            <MiniRow label="Sector" value={project.sector || "Not listed"} />
            <MiniRow label="Engineer" value={project.engineer || "Not listed"} />
            <MiniRow label="Status" value={labelize(project.status)} />
            <MiniRow label="Currency" value={project.currency || "KES"} />
          </div>
        </aside>
      </section>
    </main>
  );
}

function MoneyTile({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="border-2 border-ink bg-card p-4">
      <div className="kicker mb-2">{label}</div>
      <div className={`font-mono text-lg sm:text-xl font-bold metric-text ${alert ? "text-alert" : ""}`}>{value}</div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border hairline bg-card p-3">
      <div className="flex items-start gap-2">
        <span className="text-alert [&_svg]:w-4 [&_svg]:h-4 shrink-0 mt-0.5">{icon}</span>
        <span className="min-w-0">
          <span className="kicker block mb-1">{label}</span>
          <span className="text-sm font-medium break-words">{value}</span>
        </span>
      </div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b hairline pb-2 last:border-b-0 last:pb-0">
      <span className="kicker">{label}</span>
      <span className="text-sm text-right break-words">{value}</span>
    </div>
  );
}
