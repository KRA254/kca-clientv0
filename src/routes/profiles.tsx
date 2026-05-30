import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { PersonCard } from "@/components/PersonCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { StatTile } from "@/components/StatTile";

export const Route = createFileRoute("/profiles")({
  component: Profiles,
  head: () => ({
    meta: [
      { title: "Profiles — Kenya Corruption Archives" },
      { name: "description", content: "Directory of public officials under investigation." },
    ],
  }),
});

function Profiles() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["persons"],
    queryFn: () => api.persons({ limit: 100 }),
  });
  const { data: money } = useQuery({
    queryKey: ["analytics", "money"],
    queryFn: api.moneyAnalytics,
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader kicker="Directory" title="Corrupt persons profiles" />
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatTile label="Profiles" value={data.length} hint="Public dossier entries" />
        <StatTile
          label="Amount Linked"
          value={formatMoney(money?.topPersons?.reduce((sum, p) => sum + (p.totalAmountLinked ?? 0), 0), "KES")}
          hint="Across ranked profiles"
          alert
        />
        <StatTile
          label="Highest Exposure"
          value={<span className="font-display text-xl leading-tight">{money?.topPersons?.[0]?.name ?? "Awaiting data"}</span>}
          hint={formatMoney(money?.topPersons?.[0]?.totalAmountLinked, money?.topPersons?.[0]?.amountCurrency)}
        />
      </section>
      {isLoading ? <SkeletonList count={8} variant="card" /> :
        data.length === 0 ? <EmptyState title="No profiles yet" /> :
        <div className="grid min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.map((p) => <PersonCard key={p.id} person={p} />)}
        </div>}
    </div>
  );
}
