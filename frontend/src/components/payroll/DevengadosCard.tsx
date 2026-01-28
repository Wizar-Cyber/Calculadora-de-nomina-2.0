import { TrendingUp } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';

interface DevengadosCardProps {
  items: Record<string, number | string>;
  total: number;
  diasTrabajados?: number;
}

const formatConceptLabel = (label: string, value: number | string, diasTrabajados?: number): string => {
  switch (label) {
    case 'salario_basico':
      return `Salario Básico (${diasTrabajados || 15} días)`;
    case 'civicas':
      return `Civicas (22 pasajes)`;
    case 'auxilio':
      return 'Auxilio de Transporte';
    case 'incapacidad':
      return `Incapacidad (33.33%) | ${formatCurrency(Number(value))}`;
    default:
      // Handle formatted recargo strings like "2.5h | 34,000"
      if (typeof value === 'string' && value.includes('h |')) {
        const type = label.replace('r_', '').replace(/_/g, ' ').toUpperCase();
        return `${type}`;
      }
      if (label.startsWith('r_')) {
        const type = label.replace('r_', '').replace(/_/g, ' ').toUpperCase();
        return `${type}`;
      }
      if (label.startsWith('extra_')) {
        const type = label.replace('extra_', '').replace(/_/g, ' ').toUpperCase();
        return `Extra ${type}`;
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
  return (
    <div className="bg-white p-6 text-slate-800 flex flex-col flex-grow min-h-0">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <TrendingUp className="h-4 w-4" />
        </span>
        Devengados
      </div>
      <div className="mt-4 space-y-2 text-sm flex-grow">
        {Object.entries(items).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-slate-600">{formatConceptLabel(label, value, diasTrabajados)}</span>
            <span className="font-semibold text-slate-900">{formatCurrencyValue(value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t-2 border-emerald-500 pt-4 text-sm font-semibold">
        <span>Total Devengado</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
