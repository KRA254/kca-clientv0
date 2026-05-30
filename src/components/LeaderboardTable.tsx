import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api, type Person } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EmptyState, SkeletonList } from "./SkeletonList";

function trendIcon(t?: number) {
  if (!t || t === 0) return <Minus className="w-3 h-3 text-muted-foreground" />;
  if (t > 0) return <TrendingUp className="w-3 h-3 text-alert" />;
  return <TrendingDown className="w-3 h-3 text-green-700" />;
}

export function LeaderboardTable({ limit, range = "all" }: { limit?: number; range?: "week" | "month" | "all" }) {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", range, limit],
    queryFn: () => api.leaderboard({ range, limit }),
  });
  const rows: Person[] = (data ?? []).slice(0, limit);
  if (isLoading) return <SkeletonList count={limit ?? 5} />;
  if (rows.length === 0) return <EmptyState title="No leaderboard entries" />;
  return (
    <div className="divide-y hairline border hairline bg-card">
      {rows.map((p, i) => (
        <Link
          key={p.id}
          to="/person/$slug"
          params={{ slug: p.slug }}
          className="grid grid-cols-[auto_auto_minmax(0,1fr)] sm:flex sm:items-center gap-3 p-3 hover:bg-muted transition-colors"
        >
          <div className="font-mono text-sm w-8 text-muted-foreground">#{p.rank ?? i + 1}</div>
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover" loading="lazy" />}
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-sm leading-tight truncate">{p.name}</div>
            <div className="kicker truncate">{p.role}</div>
          </div>
          <div className="col-span-3 sm:col-span-1 sm:text-right sm:ml-auto flex sm:block items-center justify-between gap-3">
            <div className="font-mono text-sm font-semibold flex items-center gap-1 justify-end">
              {p.score} {trendIcon(p.trend)}
            </div>
            <div className="kicker text-right metric-text">{formatMoney(p.totalAmountLinked, p.amountCurrency)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
