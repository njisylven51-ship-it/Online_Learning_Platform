import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import type { PaymentProvider } from '../types';

interface PaymentFormProps {
  onSubmit: (provider: PaymentProvider, phone: string) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const PROVIDERS: { value: PaymentProvider; label: string; icon: React.ReactNode }[] = [
  { 
    value: 'mtn', 
    label: 'MTN Mobile Money',
    icon: <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFCB05] text-[9px] font-black text-[#004F9F]">MTN</div>
  },
  { 
    value: 'orange', 
    label: 'Orange Money',
    icon: <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF7900] text-[9px] font-black text-white">OM</div>
  },
];

export function PaymentForm({ onSubmit, loading, disabled = false }: PaymentFormProps) {
  const [provider, setProvider] = useState<PaymentProvider>('mtn');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const selectedProvider = PROVIDERS.find(p => p.value === provider) || PROVIDERS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Custom Provider Select */}
      <div className="relative" ref={dropdownRef}>
        <label className="mb-2 block text-sm font-bold text-carbon ml-1">
          Payment Provider
        </label>
        
        {/* Trigger Button - Updated to rounded-lg and primary-container focus */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading || disabled}
          className="flex w-full items-center justify-between rounded-lg border border-surface-container bg-surface-container-lowest px-5 py-3.5 text-sm font-semibold text-carbon shadow-sm transition hover:bg-surface-container/50 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            {selectedProvider.icon}
            {selectedProvider.label}
          </div>
          <svg className={`h-5 w-5 text-outline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Custom Dropdown Menu - Updated to rounded-lg */}
        {isOpen && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-surface-container bg-surface-container-lowest shadow-xl">
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setProvider(p.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold transition hover:bg-surface-container ${
                  provider === p.value ? 'bg-primary-container/20 text-primary' : 'text-carbon'
                }`}
              >
                {p.icon}
                {p.label}
                {provider === p.value && (
                  <svg className="ml-auto h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

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
      
      <Button 
        type="submit" 
        disabled={loading || disabled} 
        className="w-full rounded-full bg-carbon py-4 text-base font-extrabold text-white hover:bg-carbon-light mt-2"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </Button>
    </form>
  );
}