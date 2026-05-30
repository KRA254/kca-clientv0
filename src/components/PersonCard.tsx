import { Link } from "@tanstack/react-router";
import type { Person } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function Trend({ t }: { t?: number }) {
  if (!t || t === 0) return <Minus className="w-3 h-3" />;
  if (t > 0) return <TrendingUp className="w-3 h-3 text-alert" />;
  return <TrendingDown className="w-3 h-3 text-green-700" />;
}

export function PersonCard({ person, compact }: { person: Person; compact?: boolean }) {
  return (
    <Link
      to="/person/$slug"
      params={{ slug: person.slug }}
      className="group block min-w-0 border hairline bg-card hover:border-ink transition-colors"
    >
      <div className={`${compact ? "aspect-square" : "aspect-[4/3]"} overflow-hidden bg-muted`}>
        {person.imageUrl && <img src={person.imageUrl} alt={person.name} loading="lazy" className="w-full h-full object-cover" />}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          {person.rank && <span className="font-mono text-xs text-muted-foreground shrink-0">#{person.rank}</span>}
          <span className="font-mono text-xs flex items-center gap-1 bg-alert text-alert-foreground px-1.5 py-0.5 shrink-0">
            {person.score} <Trend t={person.trend} />
          </span>
        </div>
        <div className="font-display font-semibold leading-tight group-hover:underline underline-offset-2 break-words">{person.name}</div>
        <div className="kicker truncate">{person.role}</div>
        {(person.totalAmountLinked ?? 0) > 0 && (
          <div className="mt-2 font-mono text-[0.65rem] uppercase text-alert metric-text">
            {formatMoney(person.totalAmountLinked, person.amountCurrency)} linked
          </div>
        )}
      </div>
    </Link>
  );
}
