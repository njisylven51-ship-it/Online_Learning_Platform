interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({
  title,
  description = 'This page is coming soon.',
}: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-forest-tint px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-forest">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{description}</p>
    </div>
  );
}