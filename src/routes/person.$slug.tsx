import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney, labelize } from "@/lib/utils";
import { SectionHeader } from "@/components/SectionHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { StatTile } from "@/components/StatTile";
import { StatusBadge } from "@/components/StatusBadge";
import { AskArchiveAI } from "@/components/AskArchiveAI";

export const Route = createFileRoute("/person/$slug")({
  component: PersonDetail,
});

function PersonDetail() {
  const { slug } = Route.useParams();
  const { data: person, isLoading } = useQuery({
    queryKey: ["person", slug],
    queryFn: () => api.person(slug),
  });
  const { data: cases = [] } = useQuery({
    queryKey: ["cases", person?.id],
    queryFn: () => api.personCases(person!.id),
    enabled: !!person?.id,
  });
  const { data: related = [] } = useQuery({
    queryKey: ["articles", "related", "person", person?.id],
    queryFn: () => api.relatedArticles({ personId: person!.id, limit: 4 }),
    enabled: !!person?.id,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "stalled", "person", person?.id],
    queryFn: () => api.stalledProjects({ personId: person!.id, limit: 6 }),
    enabled: !!person?.id,
  });

  if (isLoading) return <div className="max-w-3xl mx-auto p-10"><SkeletonList count={4} /></div>;
  if (!person) return <div className="max-w-3xl mx-auto p-10"><EmptyState title="Profile not found" /></div>;
  const Trend = !person.trend ? Minus : person.trend > 0 ? TrendingUp : TrendingDown;
  const latestCaseYear = cases
    .map((item) => Number(item.date?.slice(0, 4)))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  const statusMix = Array.from(new Set(cases.map((item) => item.status).filter(Boolean))).slice(0, 3).map(labelize).join(", ") || "No cases";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-4 min-w-0">
          <div className="aspect-square max-h-[28rem] overflow-hidden bg-muted border-2 border-ink mb-4">
            {person.imageUrl && <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover" />}
          </div>
          <div className="kicker text-alert">Profile</div>
          <h1 className="font-display text-3xl font-bold mb-1 break-words">{person.name}</h1>
          <p className="text-muted-foreground">{person.role}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border-2 border-ink px-3 py-2">
              <div className="kicker">Score</div>
              <div className="font-mono text-xl sm:text-2xl font-bold flex items-center gap-1">{person.score} <Trend className="w-4 h-4 text-alert" /></div>
            </div>
            <div className="border-2 border-ink px-3 py-2">
              <div className="kicker">Cases</div>
              <div className="font-mono text-xl sm:text-2xl font-bold">{person.caseCount ?? cases.length}</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 min-[520px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="border hairline bg-card p-3">
              <div className="kicker">Amount Linked</div>
              <div className="font-mono text-base sm:text-lg font-bold text-alert metric-text">
                {formatMoney(person.totalAmountLinked, person.amountCurrency)}
              </div>
            </div>
            <div className="border hairline bg-card p-3">
              <div className="kicker">Recovered</div>
              <div className="font-mono text-base sm:text-lg font-bold metric-text">
                {formatMoney(person.totalAmountRecovered, person.amountCurrency)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 min-w-0">
          <SectionHeader kicker="Accountability Summary" title="At a glance" />
          <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-10">
            <StatTile label="Amount linked" value={formatMoney(person.totalAmountLinked, person.amountCurrency)} alert />
            <StatTile label="Cases" value={person.caseCount ?? cases.length} />
            <StatTile label="Projects affected" value={projects.length} />
            <StatTile label="Latest year" value={latestCaseYear ?? "Unknown"} />
            <StatTile label="Status mix" value={<span className="font-display text-lg leading-tight">{statusMix}</span>} />
          </section>

          <SectionHeader kicker="Background" title="Bio" />
          <p className="text-foreground leading-relaxed mb-10">
            {person.bio || `${person.name} has a public accountability profile in Kenya Corruption Archives.`}
          </p>

          <div className="mb-10">
            <AskArchiveAI
              target={{ type: "person", slug: person.slug }}
              title={`Ask about ${person.name}`}
              suggestions={[
                "Summarize this person's linked cases and amounts.",
                "What recent public-source updates are connected to this profile?",
                "Which stalled projects or public funds are linked here?",
              ]}
            />
          </div>

          <SectionHeader kicker="Record" title="Cases" />
          <div className="space-y-3 mb-12">
            {cases.map((c) => (
              <div key={c.id} className="border hairline bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-1">
                  <h3 className="font-display font-semibold break-words">{c.title}</h3>
                  <StatusBadge value={c.status}>{c.status}</StatusBadge>
                </div>
                <div className="kicker mb-2">{c.date}</div>
                <p className="text-sm text-muted-foreground break-words">{c.summary}</p>
                {(c.amountLost ?? c.amountInvolved ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[0.65rem] uppercase border hairline px-2 py-1 metric-text max-w-full">
                      Lost: {formatMoney(c.amountLost ?? c.amountInvolved, c.amountCurrency)}
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase border hairline px-2 py-1 max-w-full">
                      {labelize(c.amountStatus)}
                    </span>
                  </div>
                )}
                {!!c.linkedPersons?.length && (
                  <div className="mt-4 border-t hairline pt-3">
                    <div className="kicker mb-2">Linked people</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {c.linkedPersons.map((linked) => (
                        <div key={`${c.id}-${linked.id}`} className="border hairline p-2">
                          <div className="font-display font-semibold text-sm">{linked.name}</div>
                          <div className="text-xs text-muted-foreground">{linked.caseRole || linked.role}</div>
                          {linked.outcome && <div className="kicker mt-1">{linked.outcome}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {cases.length === 0 && <EmptyState title="No cases linked yet" />}
          </div>

          <SectionHeader kicker="Public Projects" title="Stalled or delayed projects" />
          <div className="space-y-3 mb-12">
            {projects.map((project) => (
              <Link key={project.id} to="/project/$slug" params={{ slug: project.slug }} className="block border hairline bg-card p-4 hover:border-ink">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold break-words">{project.name}</h3>
                    <div className="kicker">{[project.county, project.sector].filter(Boolean).join(" / ")}</div>
                  </div>
                  <StatusBadge value={project.status}>{labelize(project.status)}</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 break-words">{project.description}</p>
                <div className="mt-3 font-mono text-xs text-alert metric-text">
                  Estimated loss: {formatMoney(project.estimatedLoss, project.currency)}
                </div>
              </Link>
            ))}
            {projects.length === 0 && <EmptyState title="No linked stalled projects yet" />}
          </div>

          <SectionHeader kicker="Coverage" title="Related articles" />
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {related.map((a) => <ArticleCard key={a.id} article={a} />)}
            {related.length === 0 && <EmptyState title="No related articles yet" />}
          </div>
        </div>
      </div>
      <div className="mt-10"><Link to="/profiles" className="font-mono text-xs uppercase hover:text-alert">Back to all profiles</Link></div>
    </div>
  );
}
