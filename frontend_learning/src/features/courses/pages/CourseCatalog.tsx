
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useDebounce } from '../../../hooks/useDebounce';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { CategoryFilter } from '../components/CategoryFilter';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/CourseCardSkeleton';

const PAGE_SIZE = 12;

export default function CourseCatalog() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const categoryId = params.get('category') ?? '';
  const offset = Number(params.get('offset') ?? 0);

  const [searchInput, setSearchInput] = useState(q);
  const debounced = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debounced !== q) {
      updateParams({ q: debounced, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data: courses, loading, error, refetch } = useCourses({
    q,
    categoryId,
    limit: PAGE_SIZE,
    offset,
  });

  const { data: categories } = useCategories();

  function updateParams(updates: Record<string, string | number>) {
    const next = new URLSearchParams(params);

    for (const [key, value] of Object.entries(updates)) {
      if (value === '' || value === 0) next.delete(key);
      else next.set(key, String(value));
    }

    setParams(next, { replace: true });
  }

  function handleClearFilters() {
    setSearchInput('');
    updateParams({ q: '', category: '', offset: 0 });
  }

  const hasActiveFilters = Boolean(q || categoryId);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const activeCategoryName = categories?.find(
    (c) => String(c.id) === categoryId
  )?.name;

  return (
    <div className="w-full space-y-8 px-[4vw] sm:px-[5vw] lg:px-[4vw] xl:px-[3vw] pb-12">

      {/* Page Header and Discovery Controls */}
      <section className="w-full space-y-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <PageHeader
            title="Explore courses"
            subtitle="Discover computer science courses taught by expert instructors."
          />

          <div className="w-full lg:max-w-md">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by course title or keyword..."
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="w-full">
          <CategoryFilter
            categories={categories ?? []}
            selectedId={categoryId}
            onSelect={(id) => updateParams({ category: id, offset: 0 })}
          />
        </div>
      </section>

      {/* Results Information */}
      {!loading && !error && courses && (courses.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-on-surface-variant">
            <span>
              {courses.length === 0
                ? 'No matching courses'
                : `Showing ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
            </span>

            {activeCategoryName && (
              <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs text-on-surface">
                {activeCategoryName}
              </span>
            )}

            {q && (
              <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs text-on-surface">
                "{q}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-medium text-primary transition-colors hover:underline"
              >
                Clear filters
              </button>
            )}

            {courses.length > 0 && (
              <span className="text-xs text-outline">
                Page {currentPage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-8">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses && courses.length === 0 && (
        <div className="py-12">
          <EmptyState
            title="No courses found"
            description={
              hasActiveFilters
                ? 'Try a different search term or reset your active filters.'
                : 'No courses are published yet.'
            }
          />

          {hasActiveFilters && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg bg-carbon px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-carbon-light"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Results */}
      {!loading && !error && courses && courses.length > 0 && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <Pagination
              hasPrev={offset > 0}
              hasMore={courses.length === PAGE_SIZE}
              onPrev={() =>
                updateParams({ offset: Math.max(0, offset - PAGE_SIZE) })
              }
              onNext={() =>
                updateParams({ offset: offset + PAGE_SIZE })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
