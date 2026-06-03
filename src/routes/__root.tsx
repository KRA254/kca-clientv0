import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";

import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { NewsTicker } from "@/components/NewsTicker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="kicker text-alert mb-3">Error 404</div>
        <h1 className="font-display text-6xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you're looking for has been redacted or moved.</p>
        <Link to="/" className="mt-6 inline-flex bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="kicker text-alert mb-3">Something went wrong</div>
        <h1 className="font-display text-3xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-5 bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Kenya Corruption Archives" },
      { name: "description", content: "A public database for Kenya corruption cases, profiles, projects, and evidence trails." },
      { property: "og:title", content: "Kenya Corruption Archives" },
      { property: "og:description", content: "Corruption cases, profiles, projects, and accountability records." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Kenya Corruption Archives" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Kenya Corruption Archives",
          description: "A public database for Kenya corruption cases, profiles, projects, and evidence trails.",
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <NewsTicker />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
