export function CourseCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
      <div className="aspect-[4/3] w-full animate-pulse bg-white/10" />
      <div className="p-6">
        <div className="mb-3 h-3 w-1/3 animate-pulse rounded-full bg-white/10" />
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="mb-6 h-4 w-full animate-pulse rounded-full bg-white/10" />
        <div className="flex justify-between border-t border-white/10 pt-4">
          <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}