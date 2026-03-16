import {
  AlertTriangle,
  Briefcase,
  Heart,
  RotateCcw,
  Trash2,
  User,
  Wallet,
  Ticket,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { Button } from '@/components/ui/button';

export type PayrollAction =
  | 'Cívicas'
  | 'CP'
  | 'Susp/Lic'
  | 'Incapacidad'
  | 'Dispo'
  | 'Extras'
  | 'Deducción'
  | 'Reset';

const actions: Array<{ label: PayrollAction; icon: ComponentType<{ className?: string }> }> = [
  { label: 'Cívicas', icon: Ticket },
  { label: 'CP', icon: Briefcase },
  { label: 'Susp/Lic', icon: AlertTriangle },
  { label: 'Incapacidad', icon: Heart },
  { label: 'Dispo', icon: User },
  { label: 'Extras', icon: RotateCcw },
  { label: 'Deducción', icon: Wallet },
  { label: 'Reset', icon: Trash2 },
];

interface ActionButtonsProps {
  onAction?: (action: PayrollAction) => void;
}

export function ActionButtons({ onAction }: ActionButtonsProps) {
  return (
    <div className="rounded-lg sm:rounded-2xl border border-white/10 bg-slate-800/40 p-3 sm:p-4 shadow-lg shadow-black/20">
      <p className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
        Acciones rápidas
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="secondary"
              className="h-10 sm:h-12 justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500 hover:scale-[1.03] transition-transform"
              onClick={() => onAction?.(action.label)}
            >
              <span className="inline-flex w-full items-center justify-center gap-1 sm:gap-2 leading-none">
                <span className="inline-flex w-4 sm:w-5 items-center justify-center">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white flex-shrink-0" />
                </span>
                <span className="text-xs sm:text-sm leading-none">{action.label}</span>
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
