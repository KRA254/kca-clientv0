import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Bot, CheckCircle2, ExternalLink, Loader2, SearchX, Send, Sparkles } from "lucide-react";
import { api, type AgentAnswer, type AgentTarget } from "@/lib/api";
import { labelize } from "@/lib/utils";

type AskArchiveAIProps = {
  target: AgentTarget;
  title?: string;
  compact?: boolean;
  suggestions?: string[];
};

const defaultSuggestions = [
  "Summarize the key evidence.",
  "What is the legal status and what remains unclear?",
  "Who is linked to this record and how?",
];

export function AskArchiveAI({ target, title = "Ask Kenya Corruption AI", compact, suggestions = defaultSuggestions }: AskArchiveAIProps) {
  const [question, setQuestion] = useState("");
  const [verifyWeb, setVerifyWeb] = useState(true);
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [error, setError] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const targetLabel = useMemo(() => labelize(target.type), [target.type]);

  async function ask(nextQuestion = question) {
    const clean = nextQuestion.trim();
    if (clean.length < 3 || isAsking) return;
    setIsAsking(true);
    setError("");
    try {
      const response = await api.askAgent({ question: clean, target, verifyWeb });
      setAnswer(response);
      setQuestion(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI service could not answer right now.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <section className={`border-2 border-ink bg-card ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="kicker text-alert mb-1 inline-flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Expose AI
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold leading-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Grounded on this {targetLabel.toLowerCase()} record, with optional web verification.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider shrink-0">
          <input
            type="checkbox"
            checked={verifyWeb}
            onChange={(event) => setVerifyWeb(event.target.checked)}
            className="accent-current"
          />
          Web verify
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => ask(item)}
            disabled={isAsking}
            className="inline-flex items-center gap-1.5 border hairline px-2.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider hover:border-ink disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {item}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about evidence, linked people, latest updates, or project impact..."
          className="min-w-0 flex-1 border hairline bg-background px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={isAsking || question.trim().length < 3}
          className="inline-flex items-center justify-center gap-2 bg-ink text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Ask
        </button>
      </form>

      {error && <div className="mt-4 border border-alert bg-alert/10 px-3 py-2 text-sm text-alert">{error}</div>}

      {isAsking && (
        <div className="mt-4 border hairline bg-background p-4 text-sm text-muted-foreground">
          Reading archive context, checking sources, and preparing a cautious answer...
        </div>
      )}

      {answer && !isAsking && (
        <div className="mt-5 space-y-4 animate-fade-in">
          <WebStatus answer={answer} />

          <div className="ai-answer border hairline bg-background p-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {answer.answer}
            </ReactMarkdown>
          </div>

          {!!answer.citations.length && (
            <div>
              <div className="kicker mb-2">Citations</div>
              <div className="grid gap-2">
                {answer.citations.slice(0, 8).map((citation) => (
                  <a
                    key={`${citation.url}-${citation.title}`}
                    href={citation.url}
                    target={citation.url.startsWith("/") ? undefined : "_blank"}
                    rel={citation.url.startsWith("/") ? undefined : "noreferrer"}
                    className="flex items-start justify-between gap-3 border hairline px-3 py-2 text-xs hover:border-ink"
                  >
                    <span className="min-w-0">
                      <span className="font-display text-sm font-semibold block break-words">{citation.title}</span>
                      <span className="kicker">{labelize(citation.source_type)}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 text-alert" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function WebStatus({ answer }: { answer: AgentAnswer }) {
  if (!answer.webStatus || answer.webStatus === "not_requested" || answer.webStatus === "skipped") {
    return (
      <div className="flex items-start gap-2 border hairline bg-background px-3 py-2 text-xs text-muted-foreground">
        <SearchX className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Answered from archive records only. External web verification was not used.</span>
      </div>
    );
  }

  if (answer.webStatus === "verified") {
    return (
      <div className="flex items-start gap-2 border hairline bg-background px-3 py-2 text-xs text-muted-foreground">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-alert" />
        <span>
          External verification used {answer.webResultCount ?? 0} web result
          {(answer.webResultCount ?? 0) === 1 ? "" : "s"} alongside archive records.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 border border-alert bg-alert/10 px-3 py-2 text-xs text-alert">
      <div className="flex items-start gap-2">
        <SearchX className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          External verification was requested but no usable web results were returned. For recent questions,
          the agent will avoid giving an archive-only answer as if it were current.
        </span>
      </div>
      {!!answer.webQueries?.length && (
        <details className="text-[0.7rem]">
          <summary className="cursor-pointer font-mono uppercase tracking-wider">Search attempts</summary>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-alert/90">
            {answer.webQueries.slice(0, 4).map((query) => (
              <li key={query} className="break-words">{query}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
