import type { Article } from "@/lib/api";
import { Clock, Eye, ShieldCheck } from "lucide-react";

export function ArticleMeta({ article, compact }: { article: Article; compact?: boolean }) {
  const date = article.publishedAt ? new Date(article.publishedAt) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      {article.author && <span className="text-foreground">{article.author}</span>}
      {date && (
        <time dateTime={article.publishedAt}>
          {date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </time>
      )}
      {article.readTime && !compact && (
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.readTime} min
        </span>
      )}
      {typeof article.views === "number" && (
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3 h-3" /> {article.views.toLocaleString()} views
        </span>
      )}
      {article.verified && (
        <span className="inline-flex items-center gap-1 text-alert">
          <ShieldCheck className="w-3 h-3" /> Verified
        </span>
      )}
    </div>
  );
}
