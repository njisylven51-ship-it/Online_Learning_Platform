import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { Pagination } from '../../../components/common/Pagination';
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

  // Sync debounced input to the URL when it differs from the committed q.
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore courses"
        subtitle="Discover computer science courses taught by expert instructors."
      />

      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search by course title or keyword…"
      />

      <CategoryFilter
        categories={categories ?? []}
        selectedId={categoryId}
        onSelect={(id) => updateParams({ category: id, offset: 0 })}
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && courses && courses.length === 0 && (
        <EmptyState
          title="No courses found"
          description={
            q || categoryId
              ? 'Try a different search term or category.'
              : 'No courses are published yet.'
          }
        />
      )}

      {!loading && !error && courses && courses.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
          <Pagination
            hasPrev={offset > 0}
            hasMore={courses.length === PAGE_SIZE}
            onPrev={() => updateParams({ offset: Math.max(0, offset - PAGE_SIZE) })}
            onNext={() => updateParams({ offset: offset + PAGE_SIZE })}
          />
        </>
      )}
    </div>
  );
}