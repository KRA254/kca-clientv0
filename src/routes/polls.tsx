import { createFileRoute } from "@tanstack/react-router";
import { PollCard } from "@/components/PollCard";
import { SectionHeader } from "@/components/SectionHeader";

const METHODOLOGY =
  "One vote per browser or session is counted within the active poll window. The backend guards duplicate votes and returns the current totals after each accepted vote.";

export const Route = createFileRoute("/polls")({
  component: Polls,
  head: () => ({
    meta: [
      { title: "Polls - Kenya Corruption Archives" },
      { name: "description", content: "Weekly reader polls on accountability." },
    ],
  }),
});

function Polls() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader kicker="Reader Voice" title="Weekly poll" />
      <PollCard />
      <div className="mt-8 border hairline bg-card p-5">
        <div className="kicker text-alert mb-2">Methodology</div>
        <p className="text-sm leading-relaxed text-muted-foreground">{METHODOLOGY}</p>
      </div>
    </div>
  );
}
