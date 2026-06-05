import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Poll } from "@/lib/api";
import { Info } from "lucide-react";
import { EmptyState, SkeletonList } from "./SkeletonList";

export function PollCard({ compact = false }: { compact?: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["poll", "current"],
    queryFn: api.currentPoll,
  });
  const [voted, setVoted] = useState<string | null>(null);
  const poll: Poll | undefined = data ?? undefined;

  const mutation = useMutation({
    mutationFn: (optionId: string) => api.vote(poll!.id, optionId),
    onMutate: (optionId) => {
      setVoted(optionId);
      qc.setQueryData(["poll", "current"], (old: Poll | undefined) => {
        if (!old) return old;
        return {
          ...old,
          totalVotes: (old.totalVotes ?? 0) + 1,
          options: old.options.map((o) =>
            o.id === optionId ? { ...o, votes: (o.votes ?? 0) + 1 } : o
          ),
        };
      });
    },
    onSuccess: (freshPoll) => {
      qc.setQueryData(["poll", "current"], freshPoll);
    },
  });

  if (isLoading) return <SkeletonList count={1} />;
  if (!poll) return <EmptyState title="No active poll" />;
  const showResults = !!voted;
  const total = poll.options.reduce((s, o) => s + (o.votes ?? 0), 0) || 1;

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
          {poll.totalVotes?.toLocaleString()} votes - ends {poll.endsAt ? new Date(poll.endsAt).toLocaleDateString() : "soon"}
        </div>
      )}
    </div>
  );
}
