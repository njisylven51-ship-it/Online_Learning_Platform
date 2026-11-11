export function formatCurrency(amount: number, currency = 'XAF'): string {
  if (amount === 0) return 'Free';
  return `${amount.toLocaleString('en-US')} ${currency}`;
}