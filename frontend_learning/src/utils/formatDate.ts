export function formatDate(value: string | Date | undefined | null): string {
  // Handle missing or null dates gracefully
  if (!value) return '—';
  
  const d = typeof value === 'string' ? new Date(value) : value;
  
  // Handle Invalid Date objects
  if (!d || Number.isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}