export function SimulatorBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <h3 className="font-bold uppercase tracking-wide text-amber-800">
        Test Payment Simulator
      </h3>
      <p className="mt-1 text-sm">
        No real money will be charged. This is a simulated transaction for testing purposes.
      </p>
      <div className="mt-3 text-xs">
        <p className="font-semibold text-amber-800">Use these numbers for success:</p>
        <ul className="mt-1 grid grid-cols-2 gap-1 font-mono">
          <li>678241562</li>
          <li>678241563</li>
          <li>678241564</li>
          <li>678241565</li>
        </ul>
        <p className="mt-2 text-amber-700">Any other valid 9-digit number will fail.</p>
      </div>
    </div>
  );
}