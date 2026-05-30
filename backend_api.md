## Backend API Specification (SPA)

This document defines the backend API contract required by the current frontend. It covers all data currently mocked or hardcoded in the UI so the backend can provide equivalent data and the UI will render correctly without changes.

Base URL
- Default: `http://localhost:4000`
- Override: `VITE_API_BASE_URL`

Conventions
- All dates are ISO 8601 strings in UTC (e.g. `2026-05-18T08:00:00Z`).
- All IDs are strings.
- `slug` values are URL-safe strings.
- All responses are JSON.
- Rate limiting: backend may return `429` and the client will retry.

## Hardcoded Content Inventory -> Backend Endpoints

This section maps every currently hardcoded UI block to the endpoint that should replace it.

- Homepage hero/featured/latest articles -> `GET /articles`
- Homepage evidence trail list ("Source ledger") -> `GET /evidence/trail`
- News ticker items -> `GET /ticker` (or curated subset from `GET /articles`)
- Article detail body fallback (`MOCK_BODY`) -> `GET /articles/{slug}` should include `body`
- Article detail sources fallback -> `GET /articles/{slug}` includes `sources` (or `GET /articles/{slug}/sources`)
- Article detail key finding card -> `GET /articles/{slug}/key-finding` (or `GET /content/blocks?keys=article.keyFinding.{slug}`)
- Related articles on article detail -> `GET /articles/related?slug=...&limit=4`
- Investigations search fallback -> `GET /articles/search?q=...`
- Profiles grid -> `GET /persons`
- Leaderboard table + podium -> `GET /leaderboard?range=...`
- Person detail bio + stats -> `GET /persons/{slug}`
- Person detail cases fallback -> `GET /cases/persons/{personId}`
- Person detail related articles fallback -> `GET /articles/related?personId=...&limit=4`
- Poll widget data + votes -> `GET /polls/current`, `POST /polls/{pollId}/votes`
- Polls page methodology copy -> `GET /content/blocks?keys=polls.methodology`
- About page copy -> `GET /content/pages/about`
- Header/footer/nav copy -> `GET /content/site`

## Core Models

### Article
```json
{
	"id": "a1",
	"slug": "ministry-tender-scandal",
	"title": "Ministry Tender Scandal: Inside the Sh2.4B Phantom Contracts",
	"deck": "Short italicized subheading",
	"summary": "Short summary for listings",
	"body": "Full article body in markdown-ish plain text",
	"category": "Procurement",
	"tags": ["procurement", "investigation"],
	"author": "N. Wanjiku",
	"publishedAt": "2026-05-18T08:00:00Z",
	"readTime": 12,
	"imageUrl": "https://...",
	"sources": [
		{ "type": "Court", "title": "Petition No. 12 of 2026", "url": "https://..." }
	],
	"verified": true
}
```
Required for UI
- `id`, `slug`, `title`, `imageUrl` should always be present.
- `category` is used in lists and tags.
- `publishedAt`, `author`, `readTime`, `verified` appear in meta.
- `body` renders the article content (fallback exists but should be provided).
Body format notes
- The UI renders paragraphs by splitting on blank lines.
- Lines starting with `## ` become section headings.
- Lines starting with `> ` become blockquotes.

### Person
```json
{
	"id": "p1",
	"slug": "official-one",
	"name": "Hon. R. Mutiso",
	"role": "Former PS, Infrastructure",
	"bio": "Detailed biography",
	"imageUrl": "https://...",
	"score": 92,
	"trend": 3,
	"caseCount": 14,
	"rank": 1
}
```
Required for UI
- `id`, `slug`, `name`, `imageUrl` should always be present.
- `score`, `trend`, `caseCount`, `rank` are used in leaderboard/profile cards.

### CaseItem
```json
{
	"id": "c1",
	"title": "Procurement irregularities, 2023",
	"status": "Under Investigation",
	"date": "2023-08-10",
	"summary": "Multiple bid-rigging instances flagged."
}
```
Required for UI
- `title` and `summary` are displayed prominently.
- `status` and `date` are shown as badges/kicker.

### Comment
```json
{
	"id": "cm1",
	"author": "Reader Name",
	"body": "Comment body",
	"createdAt": "2026-05-19T11:10:00Z",
	"status": "pending",
	"replies": []
}
```
Required for UI
- `status` can be `approved` or `pending`. Pending shows badge.
- `createdAt` is formatted to a date.

### Poll
```json
{
	"id": "poll-week-21",
	"question": "Which institution should face the next independent audit?",
	"options": [
		{ "id": "o1", "label": "Ministry of Health", "votes": 412 }
	],
	"totalVotes": 1581,
	"endsAt": "2026-05-27T23:59:00Z"
}
```
Required for UI
- `options[].votes` are required when rendering results.
- `totalVotes` is shown in the results footer.

### EvidenceItem
```json
{
	"type": "Audit",
	"label": "Auditor-General Q1 Report",
	"status": "VERIFIED",
	"url": "https://..."
}
```

### TickerItem
```json
{
	"id": "a1",
	"slug": "ministry-tender-scandal",
	"title": "Ministry Tender Scandal: Inside the Sh2.4B Phantom Contracts"
}
```

### PageCopy (static content blocks)
```json
{
	"key": "polls.methodology",
	"title": "Methodology",
	"body": "One vote per browser within the 7-day window..."
}
```

### SiteConfig
```json
{
	"brand": {
		"name": "The Expose",
		"tagline": "Kenya Corruption Archives",
		"logoText": "E"
	},
	"nav": [
		{ "to": "/", "label": "Home" },
		{ "to": "/investigations", "label": "Investigations" }
	],
	"footer": {
		"about": "Independent investigative journalism documenting public corruption in Kenya.",
		"sections": [
			{ "title": "Sections", "links": [ { "to": "/polls", "label": "Polls" } ] }
		],
		"tipLine": "Secure submissions via encrypted channels. Anonymous tips welcomed."
	}
}
```

## Endpoints

### Health
GET `/health`
Response
```json
{ "status": "ok" }
```

### Articles

GET `/articles`
Query params (optional)
- `category`: filter by category
- `tag`: filter by tag
- `limit`, `offset`: pagination
Response
```json
[
	{ "id": "a1", "slug": "...", "title": "..." }
]
```

GET `/articles/{slug}`
Response: `Article`

GET `/articles/search?q=keyword`
Response: `Article[]`
Notes
- Used by Investigations search. Should return matches by title or deck at minimum.

GET `/articles/related?slug={slug}&limit=4`
Response: `Article[]`
Notes
- Used for "Read Next" and related content on article detail.

### Persons / Profiles

GET `/persons`
Query params (optional)
- `limit`, `offset`
Response: `Person[]`

GET `/persons/{slug}`
Response: `Person`

GET `/cases/persons/{personId}`
Response: `CaseItem[]`

### Leaderboard

GET `/leaderboard`
Query params (optional)
- `range`: `week` | `month` | `all`
- `limit`
Response: `Person[]`
Notes
- UI provides range buttons (Last Week, Last Month, All Time).
- Backend should return ranked persons for selected range.

### Polls

GET `/polls/current`
Response: `Poll`

POST `/polls/{pollId}/votes`
Request
```json
{ "optionId": "o1" }
```
Response: `Poll`
Notes
- Frontend does optimistic updates and expects updated totals.
- Enforce one vote per browser/session/IP if needed; still return current poll data.

### Comments

GET `/comments/articles/{articleId}`
Response: `Comment[]`

POST `/comments/articles/{articleId}`
Request
```json
{ "author": "Reader Name", "body": "Comment body" }
```
Response
```json
{ "id": "cm1", "author": "Reader Name", "body": "Comment body", "createdAt": "...", "status": "pending" }
```

### Ticker

GET `/ticker`
Response: `TickerItem[]`
Notes
- Used by news ticker. If not implemented, `/articles` can be reused, but a dedicated endpoint allows curation.

### Evidence Trail (Homepage "Source ledger")

GET `/evidence/trail`
Response: `EvidenceItem[]`
Notes
- Used on the homepage sidebar.
- Optional `url` supports linking to documents.

### Page Copy / Static Blocks

GET `/content/blocks`
Query params (optional)
- `keys`: comma-separated list of keys (e.g. `polls.methodology,article.keyFinding`)
Response
```json
[
	{ "key": "polls.methodology", "title": "Methodology", "body": "..." }
]
```
Notes
- Replace inline hardcoded copy for Polls methodology and Article key findings.

### Article Key Findings

GET `/articles/{slug}/key-finding`
Response
```json
{ "text": "Sh2.4 billion flowed through six shell entities over 18 months." }
```
Notes
- Used for the right-hand "Key Finding" card on article detail.

### Article Sources

GET `/articles/{slug}/sources`
Response
```json
[
	{ "type": "Court", "title": "Petition No. 12 of 2026", "url": "https://..." }
]
```
Notes
- If sources already included in `Article.sources`, this endpoint can be optional.

### About Page Content

GET `/content/pages/about`
Response
```json
{
	"title": "About The Expose",
	"kicker": "Our Mission",
	"sections": [
		{ "heading": "How we report", "body": "We start with documents..." },
		{ "heading": "Send a tip", "body": "We accept anonymous submissions..." },
		{ "heading": "Funding", "body": "The Expose is supported by reader contributions..." }
	]
}
```

### Site Configuration (Header/Footer)

GET `/content/site`
Response: `SiteConfig`
Notes
- Used for navigation labels, brand name/tagline, and footer copy.

## Error Handling

Error Response
```json
{
	"status": 400,
	"message": "Bad Request",
	"code": "VALIDATION_ERROR",
	"details": { "field": "reason" }
}
```

Expected Status Codes
- 200 OK: successful GET/POST
- 400 Bad Request: validation errors
- 404 Not Found: missing resource
- 429 Too Many Requests: client retries automatically
- 500 Internal Server Error

## Frontend Behavior Expectations

- The client retries `429` with short backoff.
- Search is triggered after 2+ characters.
- Poll vote should be safe to call multiple times; backend should guard duplicates and still return current totals.
- Comments are shown immediately as `pending` after submit.
- Bookmarks are client-only localStorage; no backend endpoint required.
- Header/footer/nav/about copy can be kept static or served via `/content/site` and `/content/pages/about` for CMS control.

## Sample Responses

GET `/articles`
```json
[
	{
		"id": "a1",
		"slug": "ministry-tender-scandal",
		"title": "Ministry Tender Scandal: Inside the Sh2.4B Phantom Contracts",
		"deck": "An eight-month investigation uncovers a network of shell companies...",
		"summary": "Documents obtained by The Expose reveal coordinated bid-rigging...",
		"category": "Procurement",
		"tags": ["procurement", "ministry", "investigation"],
		"author": "N. Wanjiku",
		"publishedAt": "2026-05-18T08:00:00Z",
		"readTime": 12,
		"imageUrl": "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1600&q=80",
		"verified": true
	}
]
```

GET `/persons`
```json
[
	{
		"id": "p1",
		"slug": "official-one",
		"name": "Hon. R. Mutiso",
		"role": "Former PS, Infrastructure",
		"score": 92,
		"trend": 3,
		"caseCount": 14,
		"rank": 1,
		"imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
	}
]
```

GET `/polls/current`
```json
{
	"id": "poll-week-21",
	"question": "Which institution should face the next independent audit?",
	"options": [
		{ "id": "o1", "label": "Ministry of Health", "votes": 412 },
		{ "id": "o2", "label": "County Governments", "votes": 587 }
	],
	"totalVotes": 1581,
	"endsAt": "2026-05-27T23:59:00Z"
}
```

## Coverage Matrix (UI to Endpoint)

- Homepage hero/featured/latest: `GET /articles`
- News ticker: `GET /ticker` (fallback to `GET /articles`)
- Evidence Trail list: `GET /evidence/trail`
- Profiles grid: `GET /persons`
- Person detail: `GET /persons/{slug}` and `GET /cases/persons/{personId}`
- Leaderboard table: `GET /leaderboard?range=all`
- Investigations search: `GET /articles/search?q=...`
- Article detail: `GET /articles/{slug}` + `GET /comments/articles/{articleId}`
- Related articles: `GET /articles/related?slug=...`
- Poll widget: `GET /polls/current` and `POST /polls/{pollId}/votes`
- Polls methodology: `GET /content/blocks?keys=polls.methodology`
- Article key finding: `GET /articles/{slug}/key-finding`
- About page copy: `GET /content/pages/about`
- Header/footer/nav copy: `GET /content/site`
