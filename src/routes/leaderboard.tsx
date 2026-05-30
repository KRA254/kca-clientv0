import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { SectionHeader } from "@/components/SectionHeader";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PersonCard } from "@/components/PersonCard";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";

const RANGES = ["Last Week", "Last Month", "All Time"] as const;
const RANGE_VALUES = {
  "Last Week": "week",
  "Last Month": "month",
  "All Time": "all",
} as const;

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
  head: () => ({ meta: [{ title: "Leaderboard — Kenya Corruption Archives" }, { name: "description", content: "Ranked accountability index of public officials." }] }),
});

function Leaderboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("All Time");
  const rangeValue = RANGE_VALUES[range];
  const { data = [], isLoading } = useQuery({
    queryKey: ["leaderboard", rangeValue],
    queryFn: () => api.leaderboard({ range: rangeValue, limit: 20 }),
  });
  const podium = data.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader
        kicker="Accountability Index"
        title="Leaderboard"
        action={
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`font-mono text-[0.65rem] uppercase tracking-wider px-2 py-1 border hairline ${range === r ? "bg-ink text-primary-foreground border-ink" : ""}`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 mb-10 sm:sticky sm:top-32 z-10 bg-background/90 backdrop-blur p-2 -mx-2">
        {isLoading ? <div className="col-span-3"><SkeletonList count={3} /></div> : podium.length === 0 ? <div className="col-span-3"><EmptyState title="No leaderboard entries" /></div> : podium.map((p, i) => (
          <div key={p.id} className={`border-2 border-ink p-3 sm:p-4 ${i === 0 ? "bg-amber/20" : "bg-card"}`}>
            <div className="font-mono text-xs">#{i + 1}</div>
            <div className="font-display text-lg font-bold leading-tight mt-1 break-words">{p.name}</div>
            <div className="kicker truncate">{p.role}</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold mt-2">{p.score}</div>
            <div className="font-mono text-[0.65rem] uppercase text-alert mt-1 metric-text">
              {formatMoney(p.totalAmountLinked, p.amountCurrency)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <LeaderboardTable range={rangeValue} />
        </div>
        <div className="lg:col-span-4">
          <SectionHeader kicker="Watchlist" title="Rising" />
          <div className="grid sm:grid-cols-2 gap-3">
            {data.slice(0, 4).map((p) => <PersonCard key={p.id} person={p} compact />)}
          </div>
        </div>
      </div>
    </div>
  );
}
