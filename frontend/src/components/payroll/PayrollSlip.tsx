'use client';

import { DevengadosCard } from '@/components/payroll/DevengadosCard';
import { DeduccionesCard } from '@/components/payroll/DeduccionesCard';
import { NetoCard } from '@/components/payroll/NetoCard';
import { usePayrollStore } from '@/store/usePayrollStore';

/**
 * PayrollSlip - Muestra la colilla de pago con todos los detalles
 * Obtiene todos los datos directamente del store (no de props)
 */
export function PayrollSlip() {
  const { 
    desgloseDevengados, 
    desgloseDeducciones, 
    diasTrabajados,
    devengado,
    deducciones,
    neto,
    auxilio,
    civicas
  } = usePayrollStore();

  const totalDevengadoColilla = devengado + auxilio + civicas;

  return (
    <div className="overflow-hidden rounded-lg sm:rounded-2xl border border-white/10 shadow-xl">
      <div className="flex flex-col border-y border-gray-200 sm:flex-row">
        <div className="flex-1 flex flex-col min-h-0 border-b sm:border-b-0 sm:border-r border-gray-200">
          <DevengadosCard items={desgloseDevengados} total={totalDevengadoColilla} diasTrabajados={diasTrabajados} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <DeduccionesCard items={desgloseDeducciones} total={deducciones} />
        </div>
      </div>

      <NetoCard neto={neto} dias={diasTrabajados} horas={12.5} fechaPago="30/01/26" devengado={devengado} deducciones={deducciones} auxilio={auxilio} civicas={civicas} />
    </div>
  );
}
