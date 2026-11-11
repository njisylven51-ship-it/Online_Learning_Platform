export function CourseCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 aspect-video animate-pulse rounded-md bg-forest-tint-strong" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-forest-tint-strong" />
      <div className="mt-2 h-3 w-full animate-pulse rounded bg-forest-tint-strong" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-forest-tint-strong" />
      <div className="mt-3 flex justify-between">
        <div className="h-4 w-16 animate-pulse rounded bg-forest-tint-strong" />
        <div className="h-4 w-14 animate-pulse rounded bg-forest-tint-strong" />
      </div>
    </div>
  );
}