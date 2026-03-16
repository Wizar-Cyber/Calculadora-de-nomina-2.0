import { TrendingDown } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

interface DeduccionesCardProps {
  items: Record<string, number>;
  total: number;
}

const formatDeduccionLabel = (label: string, value: number): string => {
  // Normalizar para comparación
  const labelNorm = label.toLowerCase();
  
  switch (labelNorm) {
    case 'salud':
    case 'salud (4%)':
      return 'Salud';
    case 'pensión':
    case 'pension':
    case 'pensión (4%)':
    case 'pension (4%)':
      return 'Pensión';
    default:
      // Handle labels that already contain "Suspensión" or "Licencia"
      if (label.includes('Suspensión') || label.includes('Licencia')) {
        return label;
      }
      // Return label as-is if it's already formatted (Title Case)
      return label;
  }
};

const formatDeduccionValue = (label: string, value: number): string => {
  return formatCurrency(value);
};

export function DeduccionesCard({ items, total }: DeduccionesCardProps) {
  return (
    <div className="bg-gray-50 p-3 sm:p-6 text-slate-800 flex flex-col flex-grow min-h-0">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider">
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-100 text-red-600 flex-shrink-0">
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <span className="truncate">Deducciones</span>
      </div>
      <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm flex-grow">
        {Object.entries(items || {}).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-slate-600 truncate">{formatDeduccionLabel(label, value)}</span>
            <span className="font-semibold text-slate-900 flex-shrink-0 text-right">{formatDeduccionValue(label, value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 sm:mt-4 flex items-center justify-between border-t-2 border-red-500 pt-2 sm:pt-4 text-xs sm:text-sm font-semibold">
        <span className="truncate">Total Deducciones</span>
        <span className="flex-shrink-0 text-right">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
