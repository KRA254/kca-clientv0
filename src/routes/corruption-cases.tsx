import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { api, type Article } from "@/lib/api";
import { formatMoney, labelize } from "@/lib/utils";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonList, EmptyState } from "@/components/SkeletonList";
import { SubmissionCTA } from "@/components/SubmissionCTA";
import { CalendarDays, Search } from "lucide-react";
import { caseCategories } from "@/lib/taxonomies";

export const Route = createFileRoute("/corruption-cases")({
  component: Investigations,
  head: () => ({
    meta: [
      { title: "Corruption Cases - Kenya Corruption Archives" },
      { name: "description", content: "Browse all corruption cases by category and search." },
    ],
  }),
});

function useDebounced<T>(v: T, ms = 300) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

function Investigations() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const debounced = useDebounced(query, 350);

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => api.corruptionCases({ limit: 100 }),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => api.search(debounced),
    enabled: debounced.length > 1,
  });
  const { data: money } = useQuery({
    queryKey: ["analytics", "money"],
    queryFn: api.moneyAnalytics,
  });
  const { data: caseAnalytics } = useQuery({
    queryKey: ["analytics", "cases"],
    queryFn: api.caseAnalytics,
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set([...caseCategories, ...(all.map((a) => a.category).filter(Boolean) as string[])]))],
    [all]
  );
  const years = useMemo(() => ["All", ...Array.from(new Set(all.map((a) => a.year).filter(Boolean) as number[])).sort((a, b) => b - a).map(String)], [all]);
  const source: Article[] = debounced.length > 1 ? (searchResults ?? []) : all;
  const filteredByCategory = category === "All" ? source : source.filter((a) => a.category === category);
  const filtered = year === "All" ? filteredByCategory : filteredByCategory.filter((a) => String(a.year) === year);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <SectionHeader kicker="Archive" title="Corruption Cases" />
      <div className="mb-6">
        <SubmissionCTA compact title="Missing a case from this archive?" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label className="flex-1 flex items-center gap-2 border-2 border-ink bg-card px-3 py-2">
          <Search className="w-4 h-4" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search corruption cases..."
            className="flex-1 bg-transparent outline-none font-sans text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border hairline transition-colors ${
              category === c ? "bg-ink text-primary-foreground border-ink" : "hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-8 max-w-xs">
        <label className="kicker mb-2 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-alert" /> Case year
        </label>
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="w-full border-2 border-ink bg-card px-3 py-2 font-mono text-xs uppercase tracking-wider outline-none"
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All years" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8">
          {isLoading ? <SkeletonList count={4} variant="card" /> :
            filtered.length === 0 ? <EmptyState title="No corruption cases match" hint="Try a different keyword or category." /> :
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          }
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <SectionHeader kicker="Summary" title="At a glance" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
            <div className="border hairline bg-card p-3">
              <div className="kicker">Tracked Loss</div>
              <div className="font-mono text-base sm:text-lg font-bold text-alert metric-text">
                {formatMoney(money?.byCurrency?.[0]?.totalAmountLost, String(money?.byCurrency?.[0]?._id ?? "KES"))}
              </div>
            </div>
            <div className="border hairline bg-card p-3">
              <div className="kicker">Cases</div>
              <div className="font-mono text-lg font-bold">{caseAnalytics?.totalCases ?? all.length}</div>
            </div>
          </div>
          <div className="border hairline bg-card divide-y hairline">
            {(caseAnalytics?.byStatus ?? []).slice(0, 5).map((item) => (
              <div key={String(item._id)} className="p-3 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <div className="font-display font-semibold">{labelize(item._id)}</div>
                  <div className="kicker">{item.count} cases</div>
                </div>
                <div className="font-mono text-xs text-alert sm:text-right metric-text">
                  {formatMoney(item.amountLost, "KES")}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {filtered.slice(0, 6).map((a) => (
              <ArticleCard key={a.id} article={a} variant="small" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
