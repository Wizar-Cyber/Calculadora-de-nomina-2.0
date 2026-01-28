import {
  AlertTriangle,
  Briefcase,
  FileText,
  Heart,
  RotateCcw,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const actions = [
  { label: 'Suspensión', icon: AlertTriangle },
  { label: 'Licencia', icon: FileText },
  { label: 'CP', icon: Briefcase },
  { label: 'Incapacidad', icon: Heart },
  { label: 'DISPO', icon: User },
  { label: 'Deducción', icon: Wallet },
  { label: 'Extras', icon: RotateCcw },
  { label: 'Reset', icon: Trash2 },
];

interface ActionButtonsProps {
  onAction?: (action: string) => void;
}

export function ActionButtons({ onAction }: ActionButtonsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4 shadow-lg shadow-black/20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
        Acciones rápidas
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="secondary"
              className="h-12 justify-start gap-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500 hover:scale-[1.03]"
              onClick={() => onAction?.(action.label)}
            >
              <Icon className="h-4 w-4 text-white" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
