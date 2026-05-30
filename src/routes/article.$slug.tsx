import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { api, type Article, type Comment } from "@/lib/api";
import { ArticleMeta } from "@/components/ArticleMeta";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { EmptyState, SkeletonList } from "@/components/SkeletonList";
import { SubmissionCTA } from "@/components/SubmissionCTA";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { AskArchiveAI } from "@/components/AskArchiveAI";

export const Route = createFileRoute("/article/$slug")({
  component: ArticleDetail,
});

const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "img", "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ["target"], ["rel"]],
    img: ["src", "alt", "title", "loading"],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ["http", "https", "data"],
  },
};

function MarkdownBody({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, markdownSchema]]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        img: ({ src, alt, title }) => (
          <figure>
            <img src={src ?? ""} alt={alt ?? ""} title={title} loading="lazy" />
            {alt && <figcaption>{alt}</figcaption>}
          </figure>
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  );
}

function ArticleDetail() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();
  const viewedSlug = useRef<string | null>(null);

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api.article(slug),
  });

  const { data: related = [] } = useQuery({
    queryKey: ["articles", "related", slug],
    queryFn: () => api.relatedArticles({ slug, limit: 4 }),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", article?.id],
    queryFn: () => api.comments(article!.id),
    enabled: !!article?.id,
  });
  const { data: caseRecords = [] } = useQuery({
    queryKey: ["cases", "article", article?.id],
    queryFn: () => api.articleCases(article!.id),
    enabled: !!article?.id,
  });

  const { data: keyFinding } = useQuery({
    queryKey: ["article", slug, "key-finding"],
    queryFn: () => api.articleKeyFinding(slug),
  });

  useEffect(() => {
    if (!article?.slug || viewedSlug.current === article.slug) return;
    viewedSlug.current = article.slug;

    api.recordArticleView(article.slug)
      .then((view) => {
        qc.setQueryData(["article", slug], (current: Article | undefined) =>
          current ? { ...current, views: view.views } : current
        );
      })
      .catch(() => {
        viewedSlug.current = null;
      });
  }, [article?.slug, qc, slug]);

  const [bm, setBm] = useState(false);
  const [form, setForm] = useState({ author: "", body: "" });
  const [commentError, setCommentError] = useState("");

  const postMut = useMutation({
    mutationFn: () => api.postComment(article!.id, form),
    onSuccess: (c) => {
      qc.setQueryData(["comments", article!.id], (old: Comment[] = []) => [...old, { ...c, status: "pending" }]);
      setForm({ author: "", body: "" });
      setCommentError("");
    },
    onError: (error: Error) => {
      setCommentError(error.message || "We could not submit your comment. Please check the form and try again.");
    },
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto p-10"><SkeletonList count={4} /></div>;
  }

  if (!article) {
    return <div className="max-w-3xl mx-auto p-10"><EmptyState title="Article not found" /></div>;
  }

  const bookmarked = bm || (typeof window !== "undefined" && isBookmarked(article.slug));
  const totalLost = caseRecords.reduce((sum, item) => sum + (item.amountLost ?? item.amountInvolved ?? 0), 0);
  const linkedPeopleCount = new Set(
    caseRecords.flatMap((record) => (record.linkedPersons ?? []).map((person) => person.id || person.name))
  ).size;
  const facts = [
    { label: "Case year", value: article.year ?? "Unknown" },
    { label: "Amount lost", value: totalLost > 0 ? formatMoney(totalLost, caseRecords[0]?.amountCurrency ?? "KES") : "Unstated" },
    { label: "Linked people", value: linkedPeopleCount || "None listed" },
    { label: "Sources", value: article.sources?.length ?? 0 },
    { label: "Views", value: article.views?.toLocaleString() ?? 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <article className="grid lg:grid-cols-12 gap-10">
        <aside className="hidden lg:block lg:col-span-2">
          <div className="sticky top-32">
            <div className="kicker mb-3">Contents</div>
            <ul className="space-y-2 font-mono text-xs">
              <li><a href="#paper-trail" className="hover:text-alert">01. The paper trail</a></li>
              <li><a href="#sources" className="hover:text-alert">02. Sources</a></li>
              <li><a href="#comments" className="hover:text-alert">03. Comments</a></li>
            </ul>
          </div>
        </aside>

        <div className="lg:col-span-7">
          <div className="kicker text-alert mb-3">{article.category}</div>
          <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.08] mb-5 break-words">{article.title}</h1>
          {article.deck && <p className="font-display italic text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6">{article.deck}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-y hairline py-3 mb-8">
            <ArticleMeta article={article} />
            <button
              onClick={() => { toggleBookmark(article.slug); setBm(!bookmarked); }}
              className="font-mono text-xs uppercase inline-flex items-center gap-1.5 hover:text-alert self-start sm:self-auto"
              aria-label="Bookmark"
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {bookmarked ? "Saved" : "Save"}
            </button>
          </div>

          <div className="lg:hidden border-2 border-ink bg-card p-4 mb-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="kicker text-alert mb-1">Case Facts</div>
                <div className="font-display text-xl font-semibold leading-tight">Quick record</div>
              </div>
              {article.verified && <StatusBadge value="verified">Verified</StatusBadge>}
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="border hairline p-3">
                  <dt className="kicker mb-1">{fact.label}</dt>
                  <dd className="font-mono text-sm font-bold metric-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {article.imageUrl && (
            <div className="aspect-[16/9] overflow-hidden mb-8 bg-muted">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mb-10">
            <AskArchiveAI
              target={{ type: "article", slug: article.slug }}
              title="Ask about this corruption case"
              suggestions={[
                "Summarize the key evidence and legal caveats.",
                "Find any recent updates connected to this case.",
                "Who is linked to this record and what roles are listed?",
              ]}
            />
          </div>

          <div id="paper-trail" className="prose-article max-w-none">
            {article.body ? <MarkdownBody body={article.body} /> : <p>No article body has been published yet.</p>}
          </div>

          <div id="sources" className="mt-12">
            <SectionHeader kicker="Evidence" title="Sources" />
            <ul className="space-y-2">
              {(article.sources ?? []).map((s, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 border hairline p-3 bg-card">
                  <span className="font-mono text-[0.6rem] uppercase bg-ink text-primary-foreground px-1.5 py-0.5 self-start">{s.type}</span>
                  <a href={s.url} className="text-sm hover:underline flex-1 break-words">{s.title}</a>
                </li>
              ))}
              {(article.sources ?? []).length === 0 && <li className="text-sm text-muted-foreground">No sources published yet.</li>}
            </ul>
          </div>

          <div className="mt-12">
            <SubmissionCTA compact title="Have documents connected to this case?" />
          </div>

          {!!caseRecords.length && (
            <div className="mt-12">
              <SectionHeader kicker="Profiles" title="Linked people" />
              <div className="grid sm:grid-cols-2 gap-3">
                {caseRecords.flatMap((record) => record.linkedPersons ?? []).map((person) => (
                  <Link
                    key={`${person.id}-${person.caseRole}`}
                    to="/person/$slug"
                    params={{ slug: person.slug || person.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }}
                    className="border hairline bg-card p-3 hover:border-ink"
                  >
                    <div className="font-display font-semibold">{person.name}</div>
                    <div className="text-xs text-muted-foreground">{person.caseRole || person.role}</div>
                    {person.outcome && <div className="kicker mt-2">{person.outcome}</div>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div id="comments" className="mt-12">
            <SectionHeader kicker="Discussion" title={`Comments (${comments.length})`} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCommentError("");
                if (form.author.trim().length < 2) {
                  setCommentError("Name must be at least 2 characters.");
                  return;
                }
                if (form.body.trim().length < 3) {
                  setCommentError("Comment must be at least 3 characters.");
                  return;
                }
                postMut.mutate();
              }}
              className="space-y-3 mb-8 border-2 border-ink p-4 bg-card"
            >
              <input
                required
                placeholder="Your name"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full border hairline px-3 py-2 bg-background outline-none focus:border-ink"
              />
              <textarea
                required
                rows={3}
                placeholder="Share your perspective..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full border hairline px-3 py-2 bg-background outline-none focus:border-ink"
              />
              {commentError && (
                <div className="border border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
                  {commentError}
                </div>
              )}
              <button
                type="submit"
                disabled={postMut.isPending}
                className="w-full sm:w-auto bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {postMut.isPending ? "Submitting..." : "Submit comment"}
              </button>
              <p className="kicker">Comments appear publicly after submission. Admins may remove abusive or unsafe comments.</p>
            </form>
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-muted-foreground text-sm">Be the first to comment.</p>}
              {comments.map((c) => (
                <div key={c.id} className="border-l-2 border-ink pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold">{c.author}</span>
                    {c.status === "pending" && <StatusBadge value="pending">Pending</StatusBadge>}
                    <span className="kicker">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-3 space-y-8">
          <div className="hidden lg:block border-2 border-ink bg-card p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="kicker text-alert mb-1">Case Facts</div>
                <div className="font-display text-xl font-semibold leading-tight">Quick record</div>
              </div>
              {article.verified && <StatusBadge value="verified">Verified</StatusBadge>}
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="border hairline p-3">
                  <dt className="kicker mb-1">{fact.label}</dt>
                  <dd className="font-mono text-sm font-bold metric-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="kicker mb-3 text-alert">Key Finding</div>
            <div className="border-l-4 border-alert pl-4 font-display text-xl leading-snug">
              {keyFinding?.text || article.keyFinding || "No key finding has been published yet."}
            </div>
          </div>
          <div>
            <SectionHeader kicker="Read Next" title="Related" />
            <div className="space-y-1">
              {related.map((a) => <ArticleCard key={a.id} article={a} variant="small" />)}
              {related.length === 0 && <p className="text-sm text-muted-foreground">No related articles yet.</p>}
            </div>
          </div>
        </aside>
      </article>

      <div className="mt-16">
        <Link to="/corruption-cases" className="font-mono text-xs uppercase hover:text-alert">Back to all corruption cases</Link>
      </div>
    </div>
  );
}
