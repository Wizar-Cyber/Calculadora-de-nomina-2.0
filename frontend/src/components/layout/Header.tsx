import { Calculator, Layers, Wallet } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  quincena: string;
  turnosCount: number;
  turnosTotal: number;
  neto: number;
}

export function Header({ quincena, turnosCount, turnosTotal, neto }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-800/60 px-8 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nómina Conductores TA</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              <Layers className="h-4 w-4" />
              Quincena
            </div>
            <div className="mt-1 text-2xl font-black text-white">{quincena}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              <Calculator className="h-4 w-4" />
              Turnos
            </div>
            <div className="mt-1 text-2xl font-black text-white">
              {turnosCount} <span className="text-sm font-semibold text-white/60">/ {turnosTotal}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              <Wallet className="h-4 w-4" />
              Neto
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-400">
              {formatCurrency(neto)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
