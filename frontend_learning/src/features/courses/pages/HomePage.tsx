import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/CourseCardSkeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';

function linkButton(variant: 'primary' | 'secondary') {
  const base =
    'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-base font-medium transition';
  return variant === 'primary'
    ? `${base} bg-accent text-forest font-semibold hover:bg-accent-hover`
    : `${base} border border-line bg-white text-forest hover:bg-forest-tint`;
}

export default function HomePage() {
  const featured = useCourses({ limit: 6, offset: 0 });
  const categories = useCategories();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-forest-tint via-white to-white px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-forest md:text-5xl">
            Learn computer science, one lesson at a time.
          </h1>
          <p className="mt-4 text-base text-ink-muted md:text-lg">
            Free and affordable courses taught by vetted instructors. Study at
            your own pace, from any device.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/courses" className={linkButton('primary')}>
              Browse courses
            </Link>
            <Link to="/register/teacher" className={linkButton('secondary')}>
              Become an instructor
            </Link>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-forest">Featured courses</h2>
            <p className="mt-1 text-sm text-ink-muted">Recently published by our instructors.</p>
          </div>
          <Link to="/courses" className="text-sm font-medium text-accent hover:underline">
            See all →
          </Link>
        </div>

        {featured.loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        )}
        {featured.error && (
          <ErrorState message={featured.error} onRetry={featured.refetch} />
        )}
        {!featured.loading && !featured.error && featured.data && featured.data.length === 0 && (
          <p className="text-sm text-ink-muted">
            No courses are published yet. Check back soon.
          </p>
        )}
        {!featured.loading && !featured.error && featured.data && featured.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.data && categories.data.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-forest">Browse by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.data.map((c) => (
              <Link
                key={c.id}
                to={`/courses?category=${c.id}`}
                className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-forest transition hover:border-accent hover:bg-forest-tint"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold text-forest">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: 1, title: 'Create an account', body: 'Sign up as a student in seconds.' },
            { n: 2, title: 'Find a course', body: 'Search or filter by category to match your interests.' },
            { n: 3, title: 'Start learning', body: 'Watch videos, read lessons, and track your progress.' },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-forest">
                {s.n}
              </div>
              <h3 className="text-base font-semibold text-forest">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-forest px-6 py-10 text-center text-white md:px-12 md:py-14">
        <h2 className="text-2xl font-bold md:text-3xl">Ready to start learning?</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/80">
          Create a free account and enrol in your first course today.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-base font-semibold text-forest hover:bg-accent-hover"
        >
          Get started
        </Link>
      </section>
    </div>
  );
}