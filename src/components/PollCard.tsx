import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Poll } from "@/lib/api";
import { Info } from "lucide-react";
import { EmptyState, SkeletonList } from "./SkeletonList";

export const POLL_QUERY_KEY = ["poll", "current", "live"] as const;

export function PollCard({
  compact = false,
  poll: suppliedPoll,
  isLoading: suppliedLoading = false,
}: {
  compact?: boolean;
  poll?: Poll;
  isLoading?: boolean;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: POLL_QUERY_KEY,
    queryFn: api.currentPoll,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !suppliedPoll,
  });
  const [voted, setVoted] = useState<string | null>(null);
  const poll: Poll | undefined = suppliedPoll ?? data ?? undefined;

  const mutation = useMutation({
    mutationFn: (optionId: string) => api.vote(poll!.id, optionId),
    onMutate: (optionId) => {
      setVoted(optionId);
    },
    onSuccess: (freshPoll) => {
      qc.setQueryData(POLL_QUERY_KEY, withFreshPollTotals(freshPoll));
      void qc.invalidateQueries({ queryKey: POLL_QUERY_KEY });
      void qc.refetchQueries({ queryKey: POLL_QUERY_KEY, type: "active" });
    },
  });

  if (isLoading || suppliedLoading) return <SkeletonList count={1} />;
  if (!poll) return <EmptyState title="No active poll" />;
  const showResults = !!voted;
  const actualTotal = getPollTotal(poll);
  const total = actualTotal || 1;

  return (
    <div className="border-2 border-ink bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="kicker text-alert">{poll.kind === "profiles" ? "Profile Poll" : "Reader Poll"}</div>
        <div className="group relative">
          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          <div className="absolute right-0 top-5 z-10 hidden w-[min(16rem,calc(100vw-2rem))] bg-ink p-3 font-mono text-xs leading-relaxed text-primary-foreground shadow-lg group-hover:block">
            One vote per browser. Results refresh after accepted votes.
          </div>
        </div>
      </div>
      <h3 className={`${compact ? "text-lg" : "text-xl"} font-display font-semibold leading-snug mb-4`}>
        {poll.question}
      </h3>

      <div className="space-y-2">
        {poll.options.map((o) => {
          const pct = Math.round(((o.votes ?? 0) / total) * 100);
          const optionContent = (
            <div className="flex min-w-0 items-center gap-3">
              {o.imageUrl && (
                <img src={o.imageUrl} alt="" className="h-10 w-10 shrink-0 border border-ink object-cover" loading="lazy" />
              )}
              <span className="min-w-0">
                <span className="block break-words text-sm font-medium">{o.label}</span>
                {o.description && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{o.description}</span>}
              </span>
            </div>
          );
          if (showResults) {
            return (
              <div key={o.id} className="relative overflow-hidden border hairline">
                <div
                  className={`absolute inset-y-0 left-0 ${voted === o.id ? "bg-alert/20" : "bg-muted"}`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-3 px-3 py-2">
                  {optionContent}
                  <span className="font-mono text-xs">{pct}%</span>
                </div>
              </div>
            );
          }
          return (
            <button
              key={o.id}
              onClick={() => mutation.mutate(o.id)}
              disabled={mutation.isPending}
              className="w-full border hairline px-3 py-2 text-left transition-colors hover:border-ink hover:bg-muted disabled:cursor-wait disabled:opacity-70"
            >
              {optionContent}
            </button>
          );
        })}
      </div>
      {showResults && (
        <div className="kicker mt-4">
          {actualTotal.toLocaleString()} votes - ends {poll.endsAt ? new Date(poll.endsAt).toLocaleDateString() : "soon"}
        </div>
      )}
    </div>
  );
}

function getPollTotal(poll: Poll) {
  return poll.options.reduce((sum, option) => sum + (option.votes ?? 0), 0);
}

function withFreshPollTotals(poll: Poll): Poll {
  const totalVotes = getPollTotal(poll);
  const rankings = [...poll.options]
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    .map((option, index) => ({
      ...option,
      rank: index + 1,
      percent: totalVotes ? Math.round(((option.votes ?? 0) / totalVotes) * 100) : 0,
    }));

  return { ...poll, totalVotes, rankings };
}
