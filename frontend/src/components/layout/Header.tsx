import { Layers, Wallet } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  quincena: string;
  neto: number;
}

export function Header({ quincena, neto }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-800/60 px-4 sm:px-6 md:px-8 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Nómina Conductores TA</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-left sm:grid-cols-2">
          <div className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-5 py-2 sm:py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quincena</span>
              <span className="sm:hidden">Quin.</span>
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-white">{quincena}</div>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-5 py-2 sm:py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Neto</span>
              <span className="sm:hidden">Pagar</span>
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-black text-emerald-400">
              {formatCurrency(neto)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
