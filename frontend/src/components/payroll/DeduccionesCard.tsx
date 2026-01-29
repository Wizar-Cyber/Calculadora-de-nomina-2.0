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
  // Debug log
  console.log('DeduccionesCard items:', items, 'total:', total);
  
  return (
    <div className="bg-gray-50 p-6 text-slate-800 flex flex-col flex-grow min-h-0">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
          <TrendingDown className="h-4 w-4" />
        </span>
        Deducciones
      </div>
      <div className="mt-4 space-y-2 text-sm flex-grow">
        {Object.entries(items).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-slate-600">{formatDeduccionLabel(label, value)}</span>
            <span className="font-semibold text-slate-900">{formatDeduccionValue(label, value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t-2 border-red-500 pt-4 text-sm font-semibold">
        <span>Total Deducciones</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
