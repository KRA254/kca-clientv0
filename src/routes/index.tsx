import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney, labelize } from "@/lib/utils";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeader } from "@/components/SectionHeader";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PollCard } from "@/components/PollCard";
import { PersonCard } from "@/components/PersonCard";
import { Link } from "@tanstack/react-router";
import { FileText, ShieldCheck, Link2, Landmark, Construction } from "lucide-react";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { SubmissionCTA } from "@/components/SubmissionCTA";
import { StatTile } from "@/components/StatTile";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Kenya Corruption Archives" },
      { name: "description", content: "Latest corruption cases, corrupt persons profiles, leaderboard, and weekly polls." },
    ],
  }),
});

function Home() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => api.corruptionCases({ limit: 10 }),
  });
  const { data: persons = [] } = useQuery({
    queryKey: ["persons"],
    queryFn: () => api.persons({ limit: 5 }),
  });
  const { data: evidence = [] } = useQuery({
    queryKey: ["evidence", "trail"],
    queryFn: api.evidenceTrail,
  });
  const { data: money } = useQuery({
    queryKey: ["analytics", "money"],
    queryFn: api.moneyAnalytics,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "stalled", "home"],
    queryFn: () => api.stalledProjects({ limit: 3 }),
  });

  const [hero, ...rest] = articles;
  const featured = rest.slice(0, 3);
  const latest = rest.slice(3, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Hero */}
      <section className="mb-12">
        {articlesLoading ? <SkeletonList count={1} variant="card" /> :
          hero ? <ArticleCard article={hero} variant="large" /> :
          <EmptyState title="No corruption cases yet" hint="Seed or publish cases from the backend to populate the homepage." />}
      </section>

      <hr className="hairline mb-12" />

      <section className="mb-12">
        <SubmissionCTA title="Whistleblow on a corruption case" />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatTile
          label="Tracked Loss"
          icon={<Landmark className="w-4 h-4 text-alert" />}
          value={formatMoney(money?.byCurrency?.[0]?.totalAmountLost, String(money?.byCurrency?.[0]?._id ?? "KES"))}
          hint="Across published corruption cases"
          alert
        />
        <StatTile
          label="Published Cases"
          icon={<FileText className="w-4 h-4 text-alert" />}
          value={articles.length}
          hint="Current archive sample"
        />
        <StatTile
          label="Stalled Projects"
          icon={<Construction className="w-4 h-4 text-alert" />}
          value={money?.stalledProjectsByCurrency?.[0]?.stalledProjectCount ?? projects.length}
          hint={`${formatMoney(money?.stalledProjectsByCurrency?.[0]?.totalEstimatedLoss, String(money?.stalledProjectsByCurrency?.[0]?._id ?? "KES"))} exposure`}
        />
        <StatTile
          label="Top Linked Profile"
          value={<span className="font-display text-xl leading-tight">{money?.topPersons?.[0]?.name ?? "Awaiting data"}</span>}
          hint={formatMoney(money?.topPersons?.[0]?.totalAmountLinked, money?.topPersons?.[0]?.amountCurrency)}
          alert
        />
      </section>

      {/* Featured + sidebar */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8">
          <SectionHeader kicker="Featured Cases" title="This week's deep dives" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {featured.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>

          <SectionHeader kicker="Latest" title="Newest reporting" action={
            <Link to="/corruption-cases" className="font-mono text-xs uppercase tracking-wider hover:text-alert">View all →</Link>
          } />
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {latest.map((a) => <ArticleCard key={a.id} article={a} />)}
            {!articlesLoading && latest.length === 0 && <EmptyState title="No latest reports" />}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <div>
            <SectionHeader kicker="Top Dossiers" title="Most-cited" />
            <LeaderboardTable limit={5} />
          </div>
          <PollCard />
          <div>
            <SectionHeader
              kicker="Projects"
              title="Stalled by graft"
              action={<Link to="/projects" className="font-mono text-xs uppercase tracking-wider hover:text-alert">View all</Link>}
            />
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} to="/project/$slug" params={{ slug: project.slug }} className="block border hairline bg-card p-3 hover:border-ink">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="font-display font-semibold leading-tight">{project.name}</div>
                    <StatusBadge value={project.status}>{labelize(project.status)}</StatusBadge>
                  </div>
                  <div className="kicker mt-1">{[project.county, project.sector].filter(Boolean).join(" / ")}</div>
                  <div className="font-mono text-xs text-alert mt-2 metric-text">{formatMoney(project.estimatedLoss, project.currency)} exposure</div>
                </Link>
              ))}
              {projects.length === 0 && <EmptyState title="No stalled projects yet" />}
            </div>
          </div>
          <div>
            <SectionHeader kicker="Evidence Trail" title="Source ledger" />
            <ul className="border hairline divide-y hairline bg-card">
              {evidence.map((s) => {
                const Icon = s.type.toLowerCase().includes("audit") ? ShieldCheck :
                  s.type.toLowerCase().includes("court") || s.type.toLowerCase().includes("filing") ? FileText : Link2;
                return (
                <li key={s.label} className="p-3 flex items-center gap-3">
                  <Icon className="w-4 h-4 text-alert" />
                  <div className="flex-1 min-w-0">
                    <div className="kicker">{s.type}</div>
                    {s.url ? <a href={s.url} className="text-sm font-medium truncate block hover:underline">{s.label}</a> :
                      <div className="text-sm font-medium truncate">{s.label}</div>}
                  </div>
                  <StatusBadge value={s.status}>{s.status}</StatusBadge>
                </li>
              );})}
            </ul>
          </div>
        </aside>
      </div>

      {/* Top dossiers strip */}
      <section className="mt-16">
        <SectionHeader kicker="Profiles" title="Top Dossiers" action={
          <Link to="/profiles" className="font-mono text-xs uppercase tracking-wider hover:text-alert">All profiles →</Link>
        } />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {persons.slice(0, 5).map((p) => <PersonCard key={p.id} person={p} compact />)}
        </div>
      </section>
    </div>
  );
}
