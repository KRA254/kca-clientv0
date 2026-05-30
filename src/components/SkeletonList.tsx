export function SkeletonList({ count = 3, variant = "row" }: { count?: number; variant?: "row" | "card" }) {
  return (
    <div className={variant === "card" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={variant === "card" ? "border hairline bg-card p-3" : "flex gap-4 border hairline bg-card p-3"}>
          <div className={`bg-muted animate-pulse ${variant === "card" ? "aspect-[3/2] w-full mb-4" : "w-24 h-24 shrink-0"}`} />
          <div className="flex-1 space-y-2 py-1">
            <div className="flex gap-2">
              <div className="h-5 bg-muted animate-pulse w-16" />
              <div className="h-5 bg-muted animate-pulse w-14" />
            </div>
            <div className="h-5 bg-muted animate-pulse w-full" />
            <div className="h-5 bg-muted animate-pulse w-4/5" />
            <div className="h-3 bg-muted animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-2 border-dashed hairline p-10 text-center">
      <div className="font-display text-xl font-semibold mb-1">{title}</div>
      {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
    </div>
  );
}
