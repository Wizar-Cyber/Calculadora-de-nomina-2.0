'use client';

import { usePayrollStore } from '@/store/usePayrollStore';
import { useEffect, useState } from 'react';

export function DebugPanel() {
  const { desgloseDevengados, desgloseDeducciones, diasTrabajados, devengado, auxilio, neto } = usePayrollStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log('🐛 [DEBUG] Store values updated:', {
      devengado,
      auxilio,
      neto,
      diasTrabajados,
      desgloseDevengadosKeys: Object.keys(desgloseDevengados),
      desgloseDo: Object.keys(desgloseDeducciones),
    });
  }, [devengado, auxilio, neto, diasTrabajados, desgloseDevengados, desgloseDeducciones]);

  const devengadoEmpty = Object.keys(desgloseDevengados).length === 0;
  const deduccionesEmpty = Object.keys(desgloseDeducciones).length === 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-900 border border-red-500/50 rounded-lg p-2 text-xs text-white max-w-xs">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left font-bold hover:bg-slate-800 px-2 py-1 rounded cursor-pointer"
        >
          🐛 DEBUG {isExpanded ? '▼' : '▶'}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1 bg-slate-950 rounded p-2">
            <div className={devengadoEmpty ? 'text-red-400' : 'text-green-400'}>
              desgloseDevengados: {devengadoEmpty ? '❌ EMPTY' : `✅ ${Object.keys(desgloseDevengados).length} items`}
            </div>
            {Object.entries(desgloseDevengados).slice(0, 3).map(([k, v]) => (
              <div key={k} className="ml-2 text-gray-400">
                {k}: {typeof v === 'number' ? v.toLocaleString() : v}
              </div>
            ))}
            <div className={deduccionesEmpty ? 'text-red-400' : 'text-green-400'}>
              desgloseDeducciones: {deduccionesEmpty ? '❌ EMPTY' : `✅ ${Object.keys(desgloseDeducciones).length} items`}
            </div>
            {Object.entries(desgloseDeducciones).slice(0, 3).map(([k, v]) => (
              <div key={k} className="ml-2 text-gray-400">
                {k}: {typeof v === 'number' ? v.toLocaleString() : v}
              </div>
            ))}
            <div className="text-gray-400 mt-2 pt-2 border-t border-slate-700">
              devengado: {devengado.toLocaleString()}
              <br />
              auxilio: {auxilio.toLocaleString()}
              <br />
              neto: {neto.toLocaleString()}
              <br />
              dias: {diasTrabajados}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
