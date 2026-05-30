import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader } from "@/components/SectionHeader";
import { Archive, FileCheck2, Scale, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About - Kenya Corruption Archives" },
      {
        name: "description",
        content: "How Kenya Corruption Archives documents Kenya corruption cases, public money, stalled projects, and evidence trails.",
      },
    ],
  }),
});

const principles = [
  {
    icon: FileCheck2,
    title: "Documents first",
    body: "Every case starts with public records: audit reports, court filings, parliamentary material, procurement notices, official statements, and credible reporting.",
  },
  {
    icon: Scale,
    title: "Careful language",
    body: "A charge, audit query, investigation, acquittal, or conviction are not the same thing. We label each case by its actual public-record status.",
  },
  {
    icon: Archive,
    title: "Structured memory",
    body: "The archive connects people, cases, money, projects, dates, and sources so patterns are easier to inspect over time.",
  },
  {
    icon: ShieldAlert,
    title: "Public interest",
    body: "The focus is public money and accountability. Profiles are reserved for primary figures, while other named people remain linked inside the relevant case record.",
  },
];

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="grid lg:grid-cols-12 gap-10 mb-14">
        <div className="lg:col-span-8">
          <div className="kicker text-alert mb-3">Our Mission</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.02] mb-5">
            Kenya corruption records, made readable.
          </h1>
          <p className="font-display italic text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Kenya Corruption Archives is a public accountability archive for corruption cases, public-money trails,
            stalled projects, and the people connected to them.
          </p>
        </div>
        <aside className="lg:col-span-4 border-2 border-ink bg-card p-5 self-start">
          <div className="kicker mb-3">What we track</div>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs uppercase">
            <div className="border hairline p-3">Cases</div>
            <div className="border hairline p-3">Profiles</div>
            <div className="border hairline p-3">Money Lost</div>
            <div className="border hairline p-3">Stalled Projects</div>
          </div>
        </aside>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {principles.map(({ icon: Icon, title, body }) => (
          <div key={title} className="border hairline bg-card p-4">
            <Icon className="w-5 h-5 text-alert mb-3" />
            <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 prose-article">
          <SectionHeader kicker="Method" title="How the archive works" />
          <p>
            We organize corruption records around the case, then connect each case to source material,
            primary public figures, linked people, money values, years, and affected projects.
          </p>
          <p>
            The profile directory is intentionally selective. It should show the main public figure or
            primary accountable person for a case. Additional people named in a file can still appear
            inside the case as linked profiles without crowding the public directory.
          </p>
          <p>
            Amounts are treated as evidence fields, not slogans. A figure may be alleged, audited,
            charged, recovered, court-awarded, or unknown. That distinction matters because public
            accountability should be precise.
          </p>

          <SectionHeader kicker="Corrections" title="Evidence can improve" />
          <p>
            Public records change. Cases collapse, appeals succeed, agencies publish new audits, and
            courts clarify facts. When better evidence is available, the archive should be updated
            rather than frozen.
          </p>
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="border-2 border-ink bg-card p-5">
            <div className="kicker text-alert mb-3">Send a tip</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Useful tips include document links, case numbers, dates, institutions, tender references,
              payment records, project locations, and names with clear roles.
            </p>
            <Link
              to="/corruption-cases"
              className="inline-flex bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-alert"
            >
              Browse cases
            </Link>
          </div>
          <div className="border hairline bg-card p-5">
            <div className="kicker mb-3">Editorial standard</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We distinguish allegations from findings, findings from convictions, and convictions from
              appeals. The goal is a useful public record, not careless naming.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
