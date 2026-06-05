import { Link, useRouterState } from "@tanstack/react-router";
import { Download, HeartHandshake, Menu, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/corruption-cases", label: "Corruption Cases" },
  { to: "/projects", label: "Projects" },
  { to: "/profiles", label: "Profiles" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/polls", label: "Polls" },
  { to: "/about", label: "About" },
];

const BRAND = {
  name: "Kenya Corruption Archives",
  tagline: "Public Accountability Records",
  logo: "/logo.png",
};

const FOOTER = {
  about: "A public database for Kenya corruption cases, profiles, projects, and evidence trails. Backed by sources, verified by records.",
  sections: [{ title: "Sections", links: NAV.filter((n) => n.to !== "/") }],
  tipLine: "Secure submissions via encrypted channels. Anonymous tips welcomed.",
};

const SOCIAL = {
  x: "https://x.com/KC_Archives",
};

const headerAction =
  "inline-flex h-9 items-center justify-center gap-2 px-3 font-mono text-xs uppercase leading-none transition-colors";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function usePwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  };

  return { canInstall: !!promptEvent && !installed, install, installed };
}

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
            <img
              src={BRAND.logo}
              alt=""
              className="w-10 h-10 shrink-0 object-contain"
              width={40}
              height={40}
            />
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
          <div className="hidden xl:flex items-center gap-2">
            <Link to="/donate" className={`${headerAction} bg-alert text-alert-foreground hover:bg-ink hover:text-primary-foreground`}>
              <HeartHandshake className="w-3.5 h-3.5" /> Donate
            </Link>
            <Link to="/submit" className={`${headerAction} bg-ink text-primary-foreground hover:bg-alert`}>
              <ShieldAlert className="w-3.5 h-3.5" /> Submit Tip
            </Link>
          </div>
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
            to="/donate"
            className="mt-3 flex items-center justify-center gap-2 bg-alert text-alert-foreground px-3 py-3 font-mono text-xs uppercase tracking-wider"
          >
            <HeartHandshake className="w-4 h-4" /> Donate
          </Link>
          <Link
            to="/submit"
            className="mt-2 flex items-center justify-center gap-2 bg-ink text-primary-foreground px-3 py-3 font-mono text-xs uppercase tracking-wider"
          >
            <ShieldAlert className="w-4 h-4" /> Submit evidence
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { canInstall, install, installed } = usePwaInstallPrompt();

  return (
    <footer className="border-t-2 border-ink mt-20 bg-ink text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-display font-bold text-2xl mb-2">{BRAND.name}</div>
          <p className="text-sm opacity-80 max-w-sm">{FOOTER.about}</p>
          <div className="mt-4 flex items-center gap-3">
            <img src={BRAND.logo} alt="" className="h-12 w-12 object-contain bg-white/5" width={48} height={48} />
            <div className="kicker text-amber">Installable archive app</div>
          </div>
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 border border-white/30 px-3 py-2 font-mono text-xs uppercase hover:bg-white hover:text-ink transition-colors"
          >
            <span className="grid h-4 w-4 place-items-center border border-current text-[0.65rem] leading-none">X</span>
            Follow on X
          </a>
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
          {canInstall ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 flex items-center gap-2 border border-white/30 px-3 py-2 font-mono text-xs uppercase hover:bg-white hover:text-ink transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Install app
            </button>
          ) : (
            <p className="mt-3 text-xs opacity-70">
              {installed
                ? "Installed on this device."
                : "On mobile, use your browser menu to add the archive to your home screen."}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center font-mono text-xs uppercase tracking-wider opacity-70">
        {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
      </div>
    </footer>
  );
}
