import { Calendar } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-slate-800/30 px-6 py-12 text-center">
      <Calendar className="h-16 w-16 text-white/40" />
      <p className="text-sm font-semibold text-white">Sin turnos registrados</p>
      <p className="text-xs text-white/60">Agrega un código de turno para comenzar</p>
    </div>
  );
}
