import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PollCard } from "@/components/PollCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { api, type Poll } from "@/lib/api";

const METHODOLOGY =
  "One vote per browser or session is counted within the active poll window. Polls may compare profiles, institutions, project priorities, or custom reader questions. Duplicate votes are guarded server-side and totals refresh after accepted votes.";

export const Route = createFileRoute("/polls")({
  component: Polls,
  head: () => ({
    meta: [
      { title: "Polls - Kenya Corruption Archives" },
      { name: "description", content: "Live reader polls on accountability." },
    ],
  }),
});

function Polls() {
  const { data: poll, isLoading } = useQuery({
    queryKey: ["poll", "current"],
    queryFn: api.currentPoll,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader kicker="Reader Voice" title="Live polls" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <PollCard compact />
        <PollProgressCard poll={poll ?? undefined} isLoading={isLoading} />
      </div>
      <div className="mt-8 border hairline bg-card p-5">
        <div className="kicker text-alert mb-2">How totals work</div>
        <p className="text-sm leading-relaxed text-muted-foreground">{METHODOLOGY}</p>
      </div>
    </div>
  );
}

function PollProgressCard({ poll, isLoading }: { poll?: Poll; isLoading: boolean }) {
  if (isLoading) return <SkeletonList count={1} />;
  if (!poll) return <EmptyState title="No poll rankings yet" />;

  const ranked = poll.rankings?.length
    ? poll.rankings
    : [...poll.options]
        .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
        .map((option, index) => ({
          ...option,
          rank: index + 1,
          percent: poll.totalVotes ? Math.round(((option.votes ?? 0) / poll.totalVotes) * 100) : 0,
        }));

  return (
    <section className="border-2 border-ink bg-card p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker text-alert">Progress</div>
          <h2 className="font-display text-2xl font-semibold">Current ranking</h2>
        </div>
        <div className="font-mono text-sm">{(poll.totalVotes ?? 0).toLocaleString()} votes</div>
      </div>

      <div className="space-y-3">
        {ranked.map((option) => (
          <div key={option.id} className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center border border-ink bg-primary font-mono text-xs text-primary-foreground">
                {option.rank}
              </span>
              {option.imageUrl && <img src={option.imageUrl} alt="" className="h-9 w-9 shrink-0 border border-ink object-cover" loading="lazy" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{option.label}</div>
                <div className="font-mono text-xs text-muted-foreground">{(option.votes ?? 0).toLocaleString()} votes</div>
              </div>
              <div className="font-mono text-sm">{option.percent}%</div>
            </div>
            <div className="h-2 border border-ink bg-muted">
              <div className="h-full bg-alert" style={{ width: `${option.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
