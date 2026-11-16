export function CourseCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
      <div className="aspect-[4/3] w-full animate-pulse bg-surface-container" />
      <div className="p-6">
        <div className="mb-3 h-3 w-1/3 animate-pulse rounded-full bg-surface-container" />
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded-full bg-surface-container" />
        <div className="mb-6 h-4 w-full animate-pulse rounded-full bg-surface-container" />
        <div className="flex justify-between border-t border-surface-container pt-4">
          <div className="h-4 w-16 animate-pulse rounded-full bg-surface-container" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-surface-container" />
        </div>
      </div>
    </div>
  );
}