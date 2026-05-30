import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Poll } from "@/lib/api";
import { Info } from "lucide-react";
import { EmptyState, SkeletonList } from "./SkeletonList";

export function PollCard() {
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
  });

  if (isLoading) return <SkeletonList count={1} />;
  if (!poll) return <EmptyState title="No active poll" />;
  const showResults = !!voted;
  const total = poll.options.reduce((s, o) => s + (o.votes ?? 0), 0) || 1;

  return (
    <div className="border-2 border-ink bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="kicker text-alert">Weekly Poll</div>
        <div className="group relative">
          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          <div className="absolute right-0 top-5 z-10 hidden group-hover:block w-[min(16rem,calc(100vw-2rem))] bg-ink text-primary-foreground p-3 text-xs font-mono leading-relaxed shadow-lg">
            One vote per browser. Window: 7 days. Results refresh every 60s.
          </div>
        </div>
      </div>
      <h3 className="font-display text-xl font-semibold leading-snug mb-4">{poll.question}</h3>

      <div className="space-y-2">
        {poll.options.map((o) => {
          const pct = Math.round(((o.votes ?? 0) / total) * 100);
          if (showResults) {
            return (
              <div key={o.id} className="relative border hairline overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${voted === o.id ? "bg-alert/20" : "bg-muted"}`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex justify-between items-center gap-3 px-3 py-2">
                  <span className="text-sm font-medium break-words">{o.label}</span>
                  <span className="font-mono text-xs">{pct}%</span>
                </div>
              </div>
            );
          }
          return (
            <button
              key={o.id}
              onClick={() => mutation.mutate(o.id)}
              className="w-full text-left border hairline px-3 py-2 hover:border-ink hover:bg-muted transition-colors text-sm font-medium"
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {showResults && (
        <div className="kicker mt-4">
          {poll.totalVotes?.toLocaleString()} votes · ends {poll.endsAt ? new Date(poll.endsAt).toLocaleDateString() : "soon"}
        </div>
      )}
    </div>
  );
}
