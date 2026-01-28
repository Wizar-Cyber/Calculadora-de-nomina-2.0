import { DevengadosCard } from '@/components/payroll/DevengadosCard';
import { DeduccionesCard } from '@/components/payroll/DeduccionesCard';
import { NetoCard } from '@/components/payroll/NetoCard';
import { formatCurrency } from '@/lib/utils';
import { usePayrollStore } from '@/store/usePayrollStore';

interface PayrollSlipProps {
  devengado: number;
  deducciones: number;
  neto: number;
  auxilio: number;
  civicas: number;
}

export function PayrollSlip({ devengado, deducciones, neto, auxilio, civicas }: PayrollSlipProps) {
  const { desgloseDevengados, desgloseDeducciones, diasTrabajados } = usePayrollStore();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Colilla de pago</h2>
            <p className="text-sm text-white/80">Empresa de Transporte TA</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col border-y border-gray-200 md:flex-row">
        <div className="flex-1 flex flex-col min-h-0">
          <DevengadosCard items={desgloseDevengados} total={devengado} diasTrabajados={diasTrabajados} />
        </div>
        <div className="border-l border-gray-200 flex-1 flex flex-col min-h-0">
          <DeduccionesCard items={desgloseDeducciones} total={deducciones} />
        </div>
      </div>

      <NetoCard neto={neto} dias={diasTrabajados} horas={12.5} fechaPago="30/01/26" devengado={devengado} deducciones={deducciones} auxilio={auxilio} civicas={civicas} />
    </div>
  );
}
