import { Clock, Trash2, AlertTriangle, Briefcase, FileText, Heart, User } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Shift } from '@/lib/types';
import { EmptyState } from '@/components/tables/EmptyState';
import { usePayrollStore } from '@/store/usePayrollStore';

interface ShiftTableProps {
  shifts: Shift[];
}

const getIconForTipo = (tipo: string) => {
  switch (tipo) {
    case 'CP': return <Briefcase className="h-4 w-4" />;
    case 'Suspensión': return <AlertTriangle className="h-4 w-4" />;
    case 'Licencia': return <FileText className="h-4 w-4" />;
    case 'Incapacidad': return <Heart className="h-4 w-4" />;
    case 'DISPO': return <User className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export function ShiftTable({ shifts }: ShiftTableProps) {
  const { removeShift, eventos, removeEvento } = usePayrollStore();

  // Combine shifts and eventos
  const allRecords = [
    ...shifts.map((shift, index) => ({
      ...shift,
      tipo: 'Turno',
      originalIndex: index,
      type: 'shift'
    })),
    ...eventos.map((evento, index) => ({
      ...evento,
      originalIndex: index,
      type: 'evento'
    }))
  ];

  if (allRecords.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-lg sm:rounded-2xl border border-white/5 bg-slate-800/40 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-700/50">
            <TableRow className="border-b border-white/5">
              <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm">Código</TableHead>
              <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm hidden sm:table-cell">Ingreso</TableHead>
              <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm hidden sm:table-cell">Salida</TableHead>
              <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5 text-sm">
            {allRecords.map((record, index) => (
              <TableRow key={`${record.codigo}-${record.type}-${index}`} className="hover:bg-blue-500/5">
                <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-mono font-semibold text-white text-xs sm:text-sm">
                  {record.codigo}
                </TableCell>
                <TableCell className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-white/70">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/50" />
                    {record.inicio || '---'}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-white/70">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/50" />
                    {record.fin || '---'}
                  </span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                {record.type === 'shift' && (
                  <button
                    type="button"
                    onClick={() => removeShift(record.originalIndex)}
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-400 transition-all duration-200 hover:scale-105 hover:border-red-500/40 hover:bg-red-500/20 whitespace-nowrap"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                    <span className="sm:hidden">X</span>
                  </button>
                )}
                {record.type === 'evento' && (
                  <button
                    type="button"
                    onClick={() => removeEvento(record.originalIndex)}
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-400 transition-all duration-200 hover:scale-105 hover:border-orange-500/40 hover:bg-orange-500/20 whitespace-nowrap"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                    <span className="sm:hidden">X</span>
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
