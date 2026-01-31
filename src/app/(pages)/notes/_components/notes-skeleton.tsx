export function NotesSkeleton() {
  return (
    <div className="w-full pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Button Skeleton */}
        <div className="min-h-[180px] rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 animate-pulse" />

        {/* Note Items Skeleton */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col justify-between min-h-[180px] rounded-3xl border border-border/40 bg-card p-6 shadow-sm animate-pulse">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-muted/20" />
              <div className="h-6 w-3/4 bg-muted/20 rounded-md" />
              <div className="h-4 w-1/2 bg-muted/20 rounded-md" />
            </div>
            <div className="pt-4 border-t border-border/20 flex justify-between">
              <div className="h-3 w-16 bg-muted/20 rounded-md" />
              <div className="h-6 w-6 rounded-md bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}