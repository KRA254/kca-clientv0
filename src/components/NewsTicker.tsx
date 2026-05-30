import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api";

export function NewsTicker() {
  const { data } = useQuery({
    queryKey: ["ticker"],
    queryFn: api.ticker,
    staleTime: 60_000,
  });
  const items = (data ?? []).slice(0, 8);
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="border-y hairline bg-ink text-primary-foreground overflow-hidden group">
      <div className="flex items-stretch min-w-0">
        <div className="bg-alert text-alert-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2 shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          Breaking
        </div>
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="ticker-track flex w-max gap-12 whitespace-nowrap py-2 px-6 animate-ticker [animation-duration:95s] group-hover:[animation-play-state:paused] will-change-transform">
            {loop.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                to="/article/$slug"
                params={{ slug: a.slug }}
                className="shrink-0 font-mono text-xs uppercase tracking-wider hover:text-amber transition-colors"
              >
                <span className="text-amber mr-2">●</span>
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
