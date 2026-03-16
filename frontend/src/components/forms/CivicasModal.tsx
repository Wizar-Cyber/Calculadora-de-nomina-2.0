'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePayrollStore } from '@/store/usePayrollStore';

interface CivicasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CivicasModal({ open, onOpenChange }: CivicasModalProps) {
  const { civicasCantidad, setCivicasCantidad, calculatePayroll } = usePayrollStore();
  const [temporalCivicas, setTemporalCivicas] = useState(civicasCantidad > 0 ? String(civicasCantidad) : '');

  const cantidadNumerica = temporalCivicas === ''
    ? 0
    : Math.max(0, Number.parseInt(temporalCivicas, 10) || 0);

  useEffect(() => {
    if (open) {
      setTemporalCivicas(civicasCantidad > 0 ? String(civicasCantidad) : '');
    }
  }, [open, civicasCantidad]);

  const handleGuardar = async () => {
    // Actualizar cantidad de cívicas en el store antes de recalcular
    setCivicasCantidad(cantidadNumerica);
    await calculatePayroll();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-slate-900">Agregar Cívicas</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cantidad de pasajes/cívicas
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={temporalCivicas}
              onChange={(e) => setTemporalCivicas(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              Valor actual por pasaje: $3,820
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Total a pagar:</span> ${(cantidadNumerica * 3820).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <div className="border-t p-4 flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
