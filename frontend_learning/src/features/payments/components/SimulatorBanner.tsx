export function SimulatorBanner() {
  return (
    <div className="rounded-2xl border border-tertiary-container bg-tertiary-container/30 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-on-tertiary-container">
            Test Payment Simulator
          </h3>
          <p className="mt-1 text-sm font-medium text-on-tertiary-container/80">
            No real money will be charged. This is a simulated transaction for testing purposes.
          </p>
          <div className="mt-3 text-xs font-bold text-on-tertiary-container/80">
            <p>Use these numbers for success:</p>
            <ul className="mt-1.5 grid grid-cols-2 gap-1.5 font-mono text-sm text-on-tertiary-container">
              <li className="rounded bg-white/40 px-2 py-0.5">678241562</li>
              <li className="rounded bg-white/40 px-2 py-0.5">678241563</li>
              <li className="rounded bg-white/40 px-2 py-0.5">678241564</li>
              <li className="rounded bg-white/40 px-2 py-0.5">678241565</li>
            </ul>
            <p className="mt-2">Any other valid 9-digit number will fail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}