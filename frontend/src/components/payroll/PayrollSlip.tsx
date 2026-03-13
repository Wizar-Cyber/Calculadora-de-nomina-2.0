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
  
  console.log('PayrollSlip - Received desglose:', { desgloseDevengados, desgloseDeducciones, diasTrabajados });

  return (
    <div className="overflow-hidden rounded-lg sm:rounded-2xl border border-white/10 shadow-xl">
      <div className="flex flex-col border-y border-gray-200 sm:flex-row">
        <div className="flex-1 flex flex-col min-h-0 border-b sm:border-b-0 sm:border-r border-gray-200">
          <DevengadosCard items={desgloseDevengados} total={devengado} diasTrabajados={diasTrabajados} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <DeduccionesCard items={desgloseDeducciones} total={deducciones} />
        </div>
      </div>

      <NetoCard neto={neto} dias={diasTrabajados} horas={12.5} fechaPago="30/01/26" devengado={devengado} deducciones={deducciones} auxilio={auxilio} civicas={civicas} />
    </div>
  );
}
