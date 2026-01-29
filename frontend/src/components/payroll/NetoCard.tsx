import { formatCurrency } from '@/lib/utils';

interface NetoCardProps {
  neto: number;
  dias: number;
  horas: number;
  fechaPago: string;
  devengado: number;
  deducciones: number;
  auxilio: number;
  civicas: number;
}

export function NetoCard({ neto, dias, horas, fechaPago, devengado, deducciones, auxilio, civicas }: NetoCardProps) {
  const totalDevengado = devengado + auxilio + civicas;
  
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-white/70">Neto a pagar</p>
      <p className="mt-2 sm:mt-3 text-4xl sm:text-5xl md:text-6xl font-black tabular-nums break-words">{formatCurrency(neto)}</p>

      <div className="mt-4 sm:mt-5 flex flex-row justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm">
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Devengado</p>
          <p className="text-emerald-400 font-semibold">{formatCurrency(totalDevengado)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Deducciones</p>
          <p className="text-red-400 font-semibold">{formatCurrency(deducciones)}</p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 w-full max-w-xs mx-auto px-4 sm:px-0">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-emerald-400" 
              style={{ width: `${(totalDevengado / (totalDevengado + deducciones)) * 100}%` }}
            />
            <div 
              className="bg-red-400" 
              style={{ width: `${(deducciones / (totalDevengado + deducciones)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
