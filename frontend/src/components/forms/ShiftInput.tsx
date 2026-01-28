'use client';

import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePayrollStore } from '@/store/usePayrollStore';
import { formatCurrency } from '@/lib/utils';

export function ShiftInput() {
  const { turnosDisponibles, addShift } = usePayrollStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return turnosDisponibles.slice(0, 6);
    return turnosDisponibles.filter((turno) =>
      turno.codigo.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, turnosDisponibles]);

  const handleSelect = (codigo: string) => {
    const turno = turnosDisponibles.find((item) => item.codigo === codigo);
    if (!turno) return;
    addShift({ 
      codigo: turno.codigo, 
      inicio: turno.hora_inicio.slice(0, 5), 
      fin: turno.hora_fin.slice(0, 5) 
    });
    setQuery('');
  };

  const handleAddShift = () => {
    if (!query.trim()) return;
    const turno = turnosDisponibles.find((item) => 
      item.codigo.toLowerCase() === query.toLowerCase()
    );
    if (turno) {
      addShift({ 
        codigo: turno.codigo, 
        inicio: turno.hora_inicio.slice(0, 5), 
        fin: turno.hora_fin.slice(0, 5) 
      });
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddShift();
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6 shadow-lg shadow-black/20">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Ej: D1, 162CC, 284M..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50"
          />
        </div>
        <Button 
          onClick={handleAddShift}
          disabled={!query.trim()}
          className="h-12 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isFocused && matches.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
          {matches.map((turno) => (
            <button
              type="button"
              key={turno.codigo}
              onMouseDown={() => handleSelect(turno.codigo)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-blue-500/10"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-white">{turno.codigo}</span>
                <span className="text-white/60">
                  {turno.hora_inicio?.slice(0, 5)} - {turno.hora_fin?.slice(0, 5)}
                </span>
              </div>
              <span className="text-xs text-emerald-300">
                {formatCurrency(turno.valor)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
