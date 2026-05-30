const KEY = "expose.bookmarks";

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function toggleBookmark(slug: string): string[] {
  const cur = getBookmarks();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}
