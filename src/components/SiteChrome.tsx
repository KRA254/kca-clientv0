import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/corruption-cases", label: "Corruption Cases" },
  { to: "/projects", label: "Projects" },
  { to: "/submit", label: "Submit" },
  { to: "/profiles", label: "Profiles" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/polls", label: "Polls" },
  { to: "/about", label: "About" },
];

const BRAND = {
  name: "Kenya Corruption Archives",
  tagline: "Public Accountability Records",
  logoText: "K",
};

const FOOTER = {
  about: "Independent investigative journalism documenting public corruption in Kenya. Backed by sources, verified by records.",
  sections: [{ title: "Sections", links: NAV.filter((n) => n.to !== "/") }],
  tipLine: "Secure submissions via encrypted channels. Anonymous tips welcomed.",
};

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 bg-ink text-primary-foreground px-3 py-1 font-mono text-xs">
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 shrink-0 bg-ink text-primary-foreground grid place-items-center font-display font-bold text-lg">
              {BRAND.logoText}
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-display font-bold text-base sm:text-lg tracking-tight truncate max-w-[11.5rem] min-[390px]:max-w-[14rem] sm:max-w-[20rem] lg:max-w-none">{BRAND.name}</div>
              <div className="kicker text-[0.58rem] sm:text-[0.6rem] truncate">{BRAND.tagline}</div>
            </div>
          </Link>
          <nav className="hidden xl:flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`font-mono text-xs uppercase tracking-wider px-3 py-2 hover:text-alert transition-colors ${active ? "text-alert border-b-2 border-alert" : ""}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/submit" className="hidden xl:inline-flex items-center gap-2 bg-ink text-primary-foreground px-3 py-2 font-mono text-xs uppercase hover:bg-alert transition-colors">
            <ShieldAlert className="w-3.5 h-3.5" /> Submit Tip
          </Link>
          <button
            type="button"
            className="xl:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink bg-card text-ink"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div
        id="mobile-navigation"
        className={`xl:hidden border-t-2 border-ink bg-background shadow-lg transition-[max-height,opacity] duration-200 overflow-hidden ${
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`flex items-center justify-between border hairline bg-card px-3 py-3 font-mono text-xs uppercase tracking-wider ${
                    active ? "border-ink bg-ink text-primary-foreground" : "hover:border-ink"
                  }`}
                >
                  {n.label}
                  {active && <span className="text-[0.6rem]">Current</span>}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/submit"
            className="mt-3 flex items-center justify-center gap-2 bg-alert text-alert-foreground px-3 py-3 font-mono text-xs uppercase tracking-wider"
          >
            <ShieldAlert className="w-4 h-4" /> Submit evidence
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink mt-20 bg-ink text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-display font-bold text-2xl mb-2">{BRAND.name}</div>
          <p className="text-sm opacity-80 max-w-sm">{FOOTER.about}</p>
        </div>
        {FOOTER.sections.slice(0, 1).map((section) => (
          <div key={section.title}>
            <div className="kicker text-amber mb-3">{section.title}</div>
            <ul className="space-y-1 text-sm">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to as any}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <div className="kicker text-amber mb-3">Tip Line</div>
          <p className="text-sm opacity-80">{FOOTER.tipLine}</p>
          <Link
            to="/submit"
            className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 font-mono text-xs uppercase hover:bg-alert transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Submit evidence
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center font-mono text-xs uppercase tracking-wider opacity-70">
        {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
      </div>
    </footer>
  );
}
