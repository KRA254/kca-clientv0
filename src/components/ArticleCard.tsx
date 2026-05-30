import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/api";
import { ArticleMeta } from "./ArticleMeta";
import { StatusBadge } from "./StatusBadge";

type Variant = "small" | "medium" | "large";

function ArticleChips({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {article.category && <StatusBadge value="category">{article.category}</StatusBadge>}
      {article.year && <StatusBadge value="year">{article.year}</StatusBadge>}
      {article.verified && <StatusBadge value="verified">Verified</StatusBadge>}
      {!compact && typeof article.views === "number" && (
        <StatusBadge value="views">{article.views.toLocaleString()} views</StatusBadge>
      )}
    </div>
  );
}

export function ArticleCard({ article, variant = "medium" }: { article: Article; variant?: Variant }) {
  if (variant === "large") {
    return (
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="group block animate-fade-in"
      >
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7 aspect-[16/9] overflow-hidden bg-muted">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="mb-3"><ArticleChips article={article} /></div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08] mb-4 group-hover:underline decoration-2 underline-offset-4 break-words">
              {article.title}
            </h1>
            {article.deck && (
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4 font-display italic">
                {article.deck}
              </p>
            )}
            <ArticleMeta article={article} />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "small") {
    return (
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="group flex gap-4 py-4 border-b hairline animate-fade-in"
      >
        <div className="w-24 h-24 shrink-0 overflow-hidden bg-muted">
          {article.imageUrl && <img src={article.imageUrl} alt={article.title} loading="lazy" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="kicker mb-1">{article.category}</div>
          <h3 className="font-display text-base font-semibold leading-snug group-hover:underline underline-offset-2 line-clamp-3">
            {article.title}
          </h3>
          {typeof article.views === "number" && (
            <div className="kicker mt-2">{article.views.toLocaleString()} views</div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="group block animate-fade-in"
    >
      <div className="aspect-[3/2] overflow-hidden bg-muted mb-4">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="mb-2"><ArticleChips article={article} compact /></div>
      <h3 className="font-display text-lg sm:text-xl font-semibold leading-tight mb-2 group-hover:underline underline-offset-4 decoration-2 break-words">
        {article.title}
      </h3>
      {article.deck && <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">{article.deck}</p>}
      <ArticleMeta article={article} compact />
    </Link>
  );
}
