import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { PaymentProvider } from '../types';

interface PaymentFormProps {
  onSubmit: (provider: PaymentProvider, phone: string) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const PROVIDERS = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'orange', label: 'Orange Money' },
];

export function PaymentForm({ onSubmit, loading, disabled = false }: PaymentFormProps) {
  const [provider, setProvider] = useState<PaymentProvider>('mtn');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!/^\d{9}$/.test(phone)) {
      setLocalError('Phone number must be exactly 9 digits.');
      return;
    }

    try {
      await onSubmit(provider, phone);
    } catch {
      /* error surfaced by parent */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="provider"
        label="Payment Provider"
        value={provider}
        onChange={(e) => setProvider(e.target.value as PaymentProvider)}
        options={PROVIDERS}
        disabled={loading || disabled}
      />
      <Input
        id="phone"
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
        error={localError ?? undefined}
        hint="Enter exactly 9 digits (e.g., 678241562)"
        disabled={loading || disabled}
        placeholder="678241562"
      />
      <Button type="submit" disabled={loading || disabled} className="w-full">
        {loading ? 'Processing…' : 'Pay Now'}
      </Button>
    </form>
  );
}