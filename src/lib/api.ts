export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";
export const AGENT_API_BASE =
  (import.meta as any).env?.VITE_AGENT_API_BASE_URL || "http://localhost:4100";

export class ApiError extends Error {
  status: number;

  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit, retries = 2): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  if (res.status === 429 && retries > 0) {
    const delay = (3 - retries) * 600;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return request(path, init, retries - 1);
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the status text when the response body is not JSON.
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

async function agentRequest<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  const res = await fetch(`${AGENT_API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  if (res.status === 429 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return agentRequest(path, init, retries - 1);
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || body.error || message;
    } catch {
      // Keep status text.
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  deck?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  year?: number;
  readTime?: number;
  imageUrl?: string;
  sources?: { type?: string; title: string; url: string }[];
  verified?: boolean;
  keyFinding?: string;
  views?: number;
};

export type Person = {
  id: string;
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  score?: number;
  trend?: number;
  caseCount?: number;
  totalAmountLinked?: number;
  totalAmountRecovered?: number;
  amountCurrency?: string;
  rank?: number;
};

export type CaseItem = {
  id: string;
  title: string;
  status?: string;
  date?: string;
  summary?: string;
  amountInvolved?: number;
  amountLost?: number;
  amountRecovered?: number;
  amountCurrency?: string;
  amountStatus?: string;
  linkedPersons?: {
    id: string;
    name: string;
    slug?: string;
    role?: string;
    caseRole?: string;
    outcome?: string;
    isPrimary?: boolean;
  }[];
};

export type StalledProject = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  details?: string;
  imageUrl?: string;
  county?: string;
  sector?: string;
  status?: "stalled" | "abandoned" | "delayed" | "under_review" | "completed" | "in_progress" | "failed" | "unknown";
  budgetedAmount?: number;
  amountPaid?: number;
  estimatedLoss?: number;
  currency?: string;
  contractor?: string;
  tenderAwardedTo?: string;
  engineer?: string;
  personResponsibleName?: string;
  procurementMethod?: string;
  fundingSource?: string;
  completionPercent?: number;
  personInChargeId?: string;
  caseIds?: string[];
  startDate?: string;
  expectedCompletionDate?: string;
  lastVerifiedAt?: string;
  sources?: { type?: string; title: string; url: string; description?: string }[];
};

export type PublicSubmissionResponse = {
  articleId?: string;
  corruptionCaseId?: string;
  projectId?: string;
  pseudonym: string;
  userId: string;
  status?: string;
  moderationStatus?: string;
  message: string;
};

export type AnalyticsBucket = {
  _id: string | number | null;
  count?: number;
  caseCount?: number;
  stalledProjectCount?: number;
  amountLost?: number;
  totalAmountInvolved?: number;
  totalAmountLost?: number;
  totalAmountRecovered?: number;
  totalBudgetedAmount?: number;
  totalAmountPaid?: number;
  totalEstimatedLoss?: number;
  budgetedAmount?: number;
  amountPaid?: number;
  estimatedLoss?: number;
};

export type MoneyAnalytics = {
  byCurrency: AnalyticsBucket[];
  stalledProjectsByCurrency: AnalyticsBucket[];
  topPersons: Person[];
  topCases: CaseItem[];
};

export type CaseAnalytics = {
  totalCases: number;
  byStatus: AnalyticsBucket[];
  byCategory: AnalyticsBucket[];
  byYear: AnalyticsBucket[];
  severityBands: AnalyticsBucket[];
};

export type ProjectAnalytics = {
  totals: AnalyticsBucket[];
  byStatus: AnalyticsBucket[];
  bySector: AnalyticsBucket[];
  topProjects: StalledProject[];
};

export type PersonCorruptionAnalytics = {
  person: { id: string; slug?: string; name: string } | null;
  curve: Array<{
    personId: string;
    slug?: string;
    name: string;
    year: number;
    caseCount: number;
    amountLost: number;
    amountInvolved: number;
    averageSeverity: number;
  }>;
  topPersons: Person[];
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  status?: "approved" | "pending";
  replies?: Comment[];
};

export type Poll = {
  id: string;
  question: string;
  options: { id: string; label: string; votes?: number }[];
  totalVotes?: number;
  endsAt?: string;
};

export type EvidenceItem = {
  type: string;
  label: string;
  status: string;
  url?: string;
};

export type TickerItem = {
  id: string;
  slug: string;
  title: string;
};

export type ContentBlock = {
  key: string;
  title?: string;
  body: string;
};

export type ContentPage = {
  title: string;
  kicker?: string;
  sections: { heading: string; body: string }[];
};

export type SiteConfig = {
  brand: { name: string; tagline?: string; logoText?: string };
  nav: { to: string; label: string }[];
  footer: {
    about?: string;
    sections: { title: string; links: { to: string; label: string }[] }[];
    tipLine?: string;
  };
};

export type AgentTarget =
  | { type: "article"; slug: string; query?: never }
  | { type: "person"; slug: string; query?: never }
  | { type: "project"; slug: string; query?: never }
  | { type: "search"; query: string; slug?: never };

export type AgentCitation = {
  title: string;
  url: string;
  source_type?: string;
};

export type AgentContextItem = {
  title: string;
  kind: string;
  text: string;
  url?: string | null;
  metadata?: Record<string, unknown>;
};

export type AgentAnswer = {
  answer: string;
  citations: AgentCitation[];
  contextItems: AgentContextItem[];
  webStatus?: "not_requested" | "skipped" | "verified" | "empty" | string;
  webRequired?: boolean;
  webQueries?: string[];
  webResultCount?: number;
};

export const api = {
  health: () => request<{ status: string }>("/health"),
  corruptionCases: (params: {
    category?: string;
    tag?: string;
    year?: number;
    personSlug?: string;
    personId?: string;
    limit?: number;
    offset?: number;
  } = {}) => request<Article[]>(`/corruption-cases${qs(params)}`),
  submitCorruptionCase: (body: {
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    category: string;
    year?: number;
    pseudonym?: string;
    sources: { type: string; title: string; url: string; description?: string }[];
    tags?: string[];
    images?: string[];
  }) => request<PublicSubmissionResponse>("/corruption-cases", { method: "POST", body: JSON.stringify(body) }),
  search: (q: string) => request<Article[]>(`/corruption-cases/search${qs({ q })}`),
  article: (slug: string) => request<Article>(`/corruption-cases/${slug}`),
  recordArticleView: (slug: string) =>
    request<{ articleId: string; slug: string; views: number }>(`/corruption-cases/${slug}/views`, { method: "POST" }),
  articleViews: (slug: string) =>
    request<{ articleId: string; slug: string; views: number }>(`/corruption-cases/${slug}/views`),
  relatedArticles: (params: { slug?: string; personId?: string; personSlug?: string; limit?: number }) =>
    request<Article[]>(`/corruption-cases/related${qs(params)}`),
  articleKeyFinding: (slug: string) => request<{ text: string }>(`/corruption-cases/${slug}/key-finding`),
  articleSources: (slug: string) => request<Article["sources"]>(`/corruption-cases/${slug}/sources`),
  comments: (articleId: string) => request<Comment[]>(`/comments/articles/${articleId}`),
  postComment: (articleId: string, body: { author: string; body: string }) =>
    request<Comment>(`/comments/articles/${articleId}`, { method: "POST", body: JSON.stringify(body) }),
  persons: (params: { limit?: number; offset?: number } = {}) => request<Person[]>(`/persons${qs(params)}`),
  person: (slug: string) => request<Person>(`/persons/${slug}`),
  personCases: (personId: string) => request<CaseItem[]>(`/cases/persons/${personId}`),
  articleCases: (articleId: string) => request<CaseItem[]>(`/cases/articles/${articleId}`),
  leaderboard: (params: { range?: "week" | "month" | "all"; limit?: number } = {}) =>
    request<Person[]>(`/leaderboard${qs(params)}`),
  moneyAnalytics: () => request<MoneyAnalytics>("/analytics/money"),
  caseAnalytics: () => request<CaseAnalytics>("/analytics/cases"),
  projectAnalytics: () => request<ProjectAnalytics>("/analytics/projects"),
  personCorruptionAnalytics: (personSlug?: string) =>
    request<PersonCorruptionAnalytics>(`/analytics/persons${qs({ personSlug })}`),
  projects: (params: {
    status?: StalledProject["status"];
    sector?: string;
    county?: string;
    personId?: string;
    personSlug?: string;
    caseId?: string;
    caseSlug?: string;
    limit?: number;
    offset?: number;
  } = {}) => request<StalledProject[]>(`/projects${qs(params)}`),
  submitProject: (body: {
    name: string;
    imageUrl?: string;
    description: string;
    details?: string;
    county?: string;
    sector: string;
    status?: StalledProject["status"];
    budgetedAmount?: number;
    amountPaid?: number;
    estimatedLoss?: number;
    currency?: string;
    contractor?: string;
    tenderAwardedTo?: string;
    engineer?: string;
    personResponsibleName?: string;
    procurementMethod?: string;
    fundingSource?: string;
    completionPercent?: number;
    pseudonym?: string;
    sources: { type: string; title: string; url: string; description?: string }[];
  }) => request<PublicSubmissionResponse>("/projects", { method: "POST", body: JSON.stringify(body) }),
  uploadImage: async (file: File) => {
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`${API_BASE}/uploads/images`, { method: "POST", body });
    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const payload = await res.json();
        message = payload.message || payload.error || message;
      } catch {
        // Keep the status text.
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as { url: string; publicId: string };
  },
  stalledProjects: (params: {
    status?: StalledProject["status"];
    sector?: string;
    county?: string;
    personId?: string;
    limit?: number;
    offset?: number;
  } = {}) => request<StalledProject[]>(`/projects/stalled${qs(params)}`),
  stalledProject: (slug: string) => request<StalledProject>(`/projects/stalled/${slug}`),
  currentPoll: () => request<Poll>("/polls/current"),
  vote: (pollId: string, optionId: string) =>
    request<Poll>(`/polls/${pollId}/votes`, { method: "POST", body: JSON.stringify({ optionId }) }),
  ticker: () => request<TickerItem[]>("/ticker"),
  evidenceTrail: () => request<EvidenceItem[]>("/evidence/trail"),
  contentBlocks: (keys?: string[]) =>
    request<ContentBlock[]>(`/content/blocks${qs({ keys: keys?.join(",") })}`),
  contentPage: (slug: string) => request<ContentPage>(`/content/pages/${slug}`),
  siteConfig: () => request<SiteConfig>("/content/site"),
  askAgent: (body: { question: string; target: AgentTarget; verifyWeb?: boolean }) =>
    agentRequest<AgentAnswer>("/ask", { method: "POST", body: JSON.stringify(body) }),
};
