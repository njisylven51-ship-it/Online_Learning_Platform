import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../../../utils/formatCurrency';
import { LoadingState } from '../../../components/feedback/LoadingState';

/* ---------------- helpers ---------------- */

const CARD_GRADIENTS = [
  'from-pastel-lilac/60 via-pastel-lilac/25 to-white',
  'from-pastel-mint/60 via-pastel-mint/25 to-white',
  'from-pastel-yellow/60 via-pastel-yellow/25 to-white',
  'from-pastel-pink/60 via-pastel-pink/25 to-white',
];

function CourseCard({ course, category, index = 0 }) {
  const hasThumb = Boolean(course?.thumbnail_url);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {hasThumb ? (
          <img
            src={course.thumbnail_url}
            alt={`${course.title} course thumbnail`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-3xl font-black uppercase tracking-[0.2em] text-forest/25">
              {course.level || 'Course'}
            </span>
          </div>
        )}
        {category && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-forest shadow-sm ring-1 ring-slate-200/70">
            {category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-forest sm:text-lg">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-500">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-extrabold text-forest">
            {formatCurrency(course.price_xaf)}
          </span>
          <span className="text-sm font-bold text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-forest">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-forest">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-base font-semibold text-slate-500 sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function HomePage() {
  const reduced = useReducedMotion();
  const { data: featured, loading } = useCourses({ limit: 4, offset: 0 });
  const { data: categories } = useCategories();

  const rise = (i = 0) =>
    reduced
      ? {}
      : {
          initial: { y: 20, opacity: 0 },
          whileInView: { y: 0, opacity: 1 },
          viewport: { once: true, margin: '-80px' },
          transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' },
        };

  return (
    <div className="auth-font bg-white text-slate-900">
      {/* ================= HERO (image + overlay) ================= */}
      {/*
        Background image is hotlinked from ug.edu.gh for now.
        Before launch: download it into /public/ and point the URL there
        (e.g. url('/hero-student.png')) — hotlinks can break and may have
        licensing constraints.
      */}
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
        {/* background image */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-cover bg-[position:65%_center] bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://www.ug.edu.gh/sites/default/files/2022-10/st_0.png')",
          }}
        />
        {/* directional overlay — dark left, lighter right so the student stays visible */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/25"
        />
        {/* bottom vignette for CTA legibility on shorter screens */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <motion.h1
              {...rise(1)}
              className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Level up your Computer Science skills.
            </motion.h1>

            <motion.p
              {...rise(2)}
              className="mt-6 max-w-xl text-lg font-semibold text-slate-200"
            >
              Join a gamified learning community. Master coding, build real
              projects, and earn verified certificates at your own pace.
            </motion.p>

            <motion.div
              {...rise(3)}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/register"
                className="rounded-full bg-pastel-mint px-7 py-3.5 text-center text-base font-extrabold text-forest shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
              >
                Start Learning for Free
              </Link>
              <Link
                to="/courses"
                className="rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-center text-base font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse Courses
              </Link>
            </motion.div>

            <motion.p
              {...rise(4)}
              className="mt-6 text-sm font-semibold text-slate-300"
            >
              Free to start · No credit card required
            </motion.p>
          </div>
        </div>
      </section>



      {/* ================= TRENDING ================= */}
      <section className="border-y border-slate-200/70 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Trending Courses
              </h2>
              <p className="mt-2 text-base font-semibold text-slate-500">
                Start your journey with our most popular courses.
              </p>
            </div>
            <Link
              to="/courses"
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              View All
            </Link>
          </div>

          <div className="mt-10">
            {loading ? (
              <LoadingState message="Loading courses…" />
            ) : featured?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((course, i) => {
                  const cat = categories?.find((c) => c.id === course.category_id);
                  return (
                    <motion.div key={course.id} {...rise(i)} className="h-full">
                      <CourseCard course={course} category={cat} index={i} />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-lg font-bold text-slate-900">No courses yet.</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Check back soon — new courses are added regularly.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= WHY LEARN WITH US ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why learn with us"
          title="Everything you need to become a pro."
          subtitle="Built around real progress, not just video watching."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            {...rise(0)}
            className="rounded-3xl bg-pastel-lilac p-8 text-forest shadow-lg shadow-pastel-lilac/30 sm:col-span-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-2xl">
              🎮
            </div>
            <h3 className="text-xl font-extrabold">Gamified learning path</h3>
            <p className="mt-2 max-w-lg font-bold text-forest/80">
              Earn progress as you complete lessons, pass quizzes, and submit
              assignments. Track completion course-by-course and unlock your
              certificate when you finish.
            </p>
          </motion.div>

          <motion.div
            {...rise(1)}
            className="rounded-3xl bg-pastel-mint p-8 text-forest shadow-lg shadow-pastel-mint/30"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-2xl">
              📜
            </div>
            <h3 className="text-xl font-extrabold">Verified certificates</h3>
            <p className="mt-2 font-bold text-forest/80">
              Download a certificate with a public verification code employers
              can check.
            </p>
          </motion.div>

          <motion.div
            {...rise(2)}
            className="rounded-3xl bg-pastel-yellow p-8 text-forest shadow-lg shadow-pastel-yellow/30"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-2xl">
              💡
            </div>
            <h3 className="text-xl font-extrabold">Interactive quizzes</h3>
            <p className="mt-2 font-bold text-forest/80">
              Test understanding with graded quizzes and hands-on assignments
              reviewed by your instructor.
            </p>
          </motion.div>

          <motion.div
            {...rise(3)}
            className="rounded-3xl bg-pastel-pink p-8 text-forest shadow-lg shadow-pastel-pink/30 sm:col-span-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-2xl">
              🎓
            </div>
            <h3 className="text-xl font-extrabold">Learn from reviewed instructors</h3>
            <p className="mt-2 max-w-lg font-bold text-forest/80">
              Every instructor is vetted by our team before their courses go
              live. Learn from people who've been reviewed, not just anyone
              with a webcam.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-slate-200/70 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How it works"
            title="From zero to certificate in three steps."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Create a free account',
                d: 'Sign up in under a minute. No payment required to start.',
              },
              {
                n: '02',
                t: 'Pick a course that fits your level',
                d: 'Browse beginner to advanced courses across CS topics.',
              },
              {
                n: '03',
                t: 'Learn, pass, and earn your certificate',
                d: 'Complete lessons, ace the quizzes, download your certificate.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                {...rise(i)}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <span className="text-3xl font-black text-pastel-lilac">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-900">{step.t}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEACHER CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          {...rise(0)}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-pastel-mint/40 via-white to-pastel-lilac/40 p-8 shadow-sm sm:p-12"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pastel-mint/50 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-forest">
                For instructors
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Share your expertise with the next generation.
              </h2>
              <p className="mt-2 max-w-xl font-semibold text-slate-600">
                Apply to teach, publish your courses, and reach motivated
                learners across Cameroon.
              </p>
            </div>
            <Link
              to="/register/teacher"
              className="shrink-0 rounded-full bg-forest px-7 py-3 font-extrabold text-white shadow-lg shadow-forest/20 transition hover:-translate-y-0.5 hover:bg-forest-soft"
            >
              Apply to teach
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-pastel-lilac px-6 py-16 text-center shadow-xl shadow-pastel-lilac/40 sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-white/40 blur-2xl" />

          <h2 className="relative z-10 text-3xl font-extrabold text-forest sm:text-5xl">
            Ready to write your first line of code?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-xl text-lg font-bold text-forest/80">
            Join a growing community learning computer science the fun way. No
            prior experience needed.
          </p>
          <div className="relative z-10 mt-10">
            <Link
              to="/register"
              className="inline-block rounded-full bg-forest px-10 py-4 text-lg font-extrabold text-white shadow-xl transition hover:-translate-y-1 hover:bg-forest-soft"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}