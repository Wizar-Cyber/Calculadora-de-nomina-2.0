import { TrendingUp } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

interface DevengadosCardProps {
  items: Record<string, number | string>;
  total: number;
  diasTrabajados?: number;
}

const formatConceptLabel = (label: string, value: number | string, diasTrabajados?: number): string => {
  // Handle labels that are already formatted from backend
  if (label.includes('Salario Básico') || 
      label.includes('Cívicas') || 
      label.includes('Civicas') ||
      label === 'Auxilio de Transporte' ||
      label.includes('Ordinario') ||
      label.includes('Festivo') ||
      label.includes('Incapacidad') ||
      label.includes('Horas extras') ||
      label.includes('horas extras')) {
    return label;
  }
  
  // Fallback for old format labels
  const labelNorm = label.toLowerCase();
  switch (labelNorm) {
    case 'salario_basico':
      return `Salario Básico (${diasTrabajados || 15} días)`;
    case 'civicas':
      return `Civicas (22 pasajes)`;
    case 'auxilio':
      return 'Auxilio de Transporte';
    default:
      // Handle formatted recargo strings like "2.5h | 34,000"
      if (typeof value === 'string' && value.includes('h |')) {
        return label;
      }
      return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const formatCurrencyValue = (value: number | string): string => {
  if (typeof value === 'string' && value.includes('h |')) {
    // Already formatted like "2.5h | 34,000"
    return value;
  }
  if (typeof value === 'string' && value.includes('% |')) {
    // Already formatted like "Incapacidad (33.33%) | $24,818"
    return '';
  }
  return formatCurrency(Number(value));
};

export function DevengadosCard({ items, total, diasTrabajados }: DevengadosCardProps) {
  // Debug log
  console.log('DevengadosCard items:', items, 'total:', total);
  
  return (
    <div className="bg-white p-3 sm:p-6 text-slate-800 flex flex-col flex-grow min-h-0">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider">
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <span className="truncate">Devengados</span>
      </div>
      <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm flex-grow">
        {Object.entries(items).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-slate-600 truncate">{formatConceptLabel(label, value, diasTrabajados)}</span>
            <span className="font-semibold text-slate-900 flex-shrink-0 text-right">{formatCurrencyValue(value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 sm:mt-4 flex items-center justify-between border-t-2 border-emerald-500 pt-2 sm:pt-4 text-xs sm:text-sm font-semibold">
        <span className="truncate">Total Devengado</span>
        <span className="flex-shrink-0 text-right">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
