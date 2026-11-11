import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/CourseCardSkeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';

// e_trim removes the transparent borders automatically
const HERO_IMAGE =
  'https://res.cloudinary.com/vo8xndxy/image/upload/e_trim/v1794356728/afican_student.png';

const FEATURES = [
  {
    title: '24/7 help',
    body: 'Our large network of support can help motivate and guide you anytime — no matter where you are on your journey.',
  },
  {
    title: '1-hour avg. response time',
    body: 'Get all your queries answered quickly and unfettered in a span of one hour or less.',
  },
  {
    title: 'Highly vetted',
    body: 'Our instructors complete a multi-step hiring process and a streamlined interview program.',
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('');
  const featured = useCourses({ categoryId: activeCategory, limit: 8, offset: 0 });
  const categories = useCategories();

  return (
    <div className="space-y-16 py-2">
      {/* ---------- HERO ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] text-forest md:text-5xl lg:text-6xl">
            Education that prepares you for{' '}
            <span className="text-accent-deep">what&rsquo;s next.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base text-ink-muted md:text-lg">
            Start, switch, or advance your career with thousands of
            computer-science courses, professional certificates, and
            practical lessons from world-class instructors.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/courses">
              <Button size="lg">Explore Courses →</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Get started
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero visual — h-fit keeps the container exactly the image's height */}
        <div className="relative mx-auto h-fit w-full max-w-md lg:max-w-lg lg:self-center">
          <img
            src={HERO_IMAGE}
            alt="Student learning computer science"
            className="h-auto w-full object-contain"
            loading="eager"
          />

          {/* Success rate card — floating bottom left */}
          <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl bg-accent px-5 py-4 shadow-xl md:-left-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-lg text-accent">
              ⚡
            </span>
            <div>
              <p className="text-2xl font-black leading-none text-forest">93%</p>
              <p className="mt-1 text-xs font-semibold text-forest/80">
                Success Rates
              </p>
            </div>
          </div>

          {/* Star badge — floating top right */}
          <div className="absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-xl bg-forest shadow-xl md:-right-4">
            <span className="text-2xl text-accent">★</span>
          </div>
        </div>
      </section>

      {/* ---------- FEATURE HIGHLIGHTS ---------- */}
      <section className="grid gap-4 md:grid-cols-3 md:gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-line bg-white p-6 shadow-sm transition hover:border-accent/50 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-forest">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{f.body}</p>
            <Link
              to="/courses"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:text-accent"
            >
              More about this <span aria-hidden>→</span>
            </Link>
          </div>
        ))}
      </section>

      {/* ---------- POPULAR COURSES ---------- */}
      <section>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep">
            Popular Courses
          </p>
          <h2 className="mt-2 text-3xl font-bold text-forest md:text-4xl">
            Find your perfect program.
          </h2>
        </div>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('')}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              activeCategory === ''
                ? 'bg-forest text-cream shadow-sm'
                : 'bg-forest-tint text-forest hover:bg-forest-tint-strong',
            ].join(' ')}
          >
            All Courses
          </button>
          {(categories.data ?? []).slice(0, 5).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium transition',
                activeCategory === c.id
                  ? 'bg-forest text-cream shadow-sm'
                  : 'bg-forest-tint text-forest hover:bg-forest-tint-strong',
              ].join(' ')}
            >
              {c.name}
            </button>
          ))}
          <Link
            to="/courses"
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-forest transition hover:border-accent hover:text-accent-deep"
          >
            View All Courses
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {featured.loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          )}

          {featured.error && (
            <ErrorState message={featured.error} onRetry={featured.refetch} />
          )}

          {!featured.loading && !featured.error && featured.data && featured.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-line bg-forest-tint px-6 py-12 text-center text-sm text-ink-muted">
              {activeCategory
                ? 'No published courses in this category yet.'
                : 'No courses are published yet. Check back soon.'}
            </div>
          )}

          {!featured.loading && !featured.error && featured.data && featured.data.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.data.map((c) => {
                const cat = categories.data?.find((cat) => cat.id === c.category_id);
                return <CourseCard key={c.id} course={c} categoryName={cat?.name} />;
              })}
            </div>
          )}
        </div>

        {featured.data && featured.data.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                Explore All Courses →
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* ---------- CTA ---------- */}
      <section className="rounded-2xl bg-forest px-6 py-12 text-center text-cream md:px-12 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 md:text-base">
          Create a free account and enrol in your first course today. No credit
          card required for free courses.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register">
            <Button size="lg">Create free account</Button>
          </Link>
          <Link to="/courses">
            <Button size="lg" variant="secondary">
              Browse courses
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}