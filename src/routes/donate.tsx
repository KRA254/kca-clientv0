import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, HeartHandshake, Server, ShieldCheck, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/donate")({
  component: Donate,
  head: () => ({
    meta: [
      { title: "Donate - Kenya Corruption Archives" },
      {
        name: "description",
        content: "Support hosting, domain, evidence storage, research tools, and public accountability work.",
      },
    ],
  }),
});

const wallets = [
  {
    id: "btc",
    name: "Bitcoin",
    network: "BTC",
    note: "Use only the Bitcoin network.",
    address: "bc1qfvutnlm0696jvcler602dad6cr3xl0hzhkman2",
  },
  {
    id: "evm",
    name: "EVM stablecoins",
    network: "Ethereum, Celo, Base, Polygon, Arbitrum and other EVM chains",
    note: "Use for ETH, CELO, USDT, USDC, and other supported EVM assets.",
    address: "0x2afb4ec8644D8D4EFa462B5ecC3b6893d8ba98e3",
  },
  {
    id: "sol",
    name: "Solana",
    network: "Solana",
    note: "Use for SOL, USDT, and USDC on Solana.",
    address: "xeKE6nhUqphc9o5mHs5rrp6m1yLp6kWLaF4q59YUQ5f",
  },
];

const tracker = {
  currency: "KES",
  received: 0,
  updatedAt: "Updates automatically after reconciliation",
  needs: [
    { label: "Domain and DNS", description: "Keeping the archive reachable and properly configured.", icon: <ExternalLink /> },
    { label: "Hosting and database", description: "Serving pages, records, profiles, projects, and search reliably.", icon: <Server /> },
    { label: "Evidence storage and backups", description: "Preserving documents, images, source links, and recovery copies.", icon: <ShieldCheck /> },
    { label: "Research and verification tools", description: "Supporting source checks, AI assistance, and long-form record review.", icon: <Wallet /> },
  ],
};

function Donate() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7">
          <div className="kicker text-alert mb-3">Support the archive</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.02] mb-5">
            Help keep Kenya Corruption Archives online.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            Donations help pay for the practical work behind the archive: domain renewals, hosting,
            database storage, backups, source verification tools, and long-form public-interest research.
          </p>
          <div className="border-2 border-ink bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            Send only on the listed network. Crypto transfers are final, so confirm the address and
            chain before sending. The donation tracker updates automatically after reconciliation.
          </div>
        </div>

        <aside className="lg:col-span-5 border-2 border-ink bg-card p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <HeartHandshake className="w-6 h-6 text-alert shrink-0" />
            <div>
              <div className="kicker text-alert">Donation tracker</div>
              <h2 className="font-display text-2xl font-semibold">Monthly operations</h2>
            </div>
          </div>
          <div className="mb-4">
            <Metric label="Received" value={formatMoney(tracker.received, tracker.currency)} />
          </div>
          <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase text-muted-foreground">
            <span>Transparent support log</span>
            <span>{tracker.updatedAt}</span>
          </div>
        </aside>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Wallets" title="Donate by crypto" />
        <div className="grid lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Support" title="What donations cover" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tracker.needs.map((need) => (
            <div key={need.label} className="border hairline bg-card p-4">
              <div className="text-alert mb-3 [&_svg]:w-5 [&_svg]:h-5">{need.icon}</div>
              <div className="font-display font-semibold leading-tight mb-2">{need.label}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{need.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function WalletCard({ wallet }: { wallet: (typeof wallets)[number] }) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="border-2 border-ink bg-card p-4 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="kicker text-alert">{wallet.network}</div>
          <h2 className="font-display text-2xl font-semibold leading-tight">{wallet.name}</h2>
        </div>
        <Wallet className="w-5 h-5 text-alert shrink-0" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{wallet.note}</p>
      <div className="border hairline bg-background p-3 font-mono text-xs break-all leading-relaxed mb-3">
        {wallet.address}
      </div>
      <button
        type="button"
        onClick={copyAddress}
        className="w-full inline-flex items-center justify-center gap-2 bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied" : "Copy address"}
      </button>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border hairline bg-background p-3">
      <div className="kicker mb-1">{label}</div>
      <div className="font-mono text-base sm:text-lg font-bold metric-text">{value}</div>
    </div>
  );
}
