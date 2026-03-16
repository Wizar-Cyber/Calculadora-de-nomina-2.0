'use client';

import { useEffect, useState } from 'react';

import { Header } from '@/components/layout/Header';
import { ShiftInput } from '@/components/forms/ShiftInput';
import { ActionButtons } from '@/components/forms/ActionButtons';
import type { PayrollAction } from '@/components/forms/ActionButtons';
import { ShiftTable } from '@/components/tables/ShiftTable';
import { PayrollSlip } from '@/components/payroll/PayrollSlip';
import { QuincenaSelect } from '@/components/forms/QuincenaSelect';
import { Footer } from '@/components/layout/Footer';
import { ExtrasModal } from '@/components/forms/ExtrasModal';
import { DispoModal } from '@/components/forms/DispoModal';
import { CivicasModal } from '@/components/forms/CivicasModal';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { usePayrollStore } from '@/store/usePayrollStore';

export default function Home() {
  const [modalType, setModalType] = useState<'extras' | 'deduccion' | null>(null);
  const [dispoModalOpen, setDispoModalOpen] = useState(false);
  const [civicasModalOpen, setCivicasModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const {
    quincena,
    shifts,
    eventos,
    neto,
    loadTurnos,
    addCP,
    addSuspension,
    addIncapacidad,
    addDispo,
    resetPayroll,
  } = usePayrollStore();

  useEffect(() => {
    void loadTurnos();
    void resetPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header quincena={quincena} neto={neto} />

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-8 sm:space-y-12">
        
        {/* SECCIÓN CONFIGURACIÓN */}
        <section>
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">Configuración</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              <QuincenaSelect />
              <ShiftInput />
            </div>
            <div>
              <ActionButtons
                onAction={async (action: PayrollAction) => {
                  if (action === 'Extras') setModalType('extras');
                  if (action === 'Deducción') setModalType('deduccion');
                  if (action === 'Cívicas') setCivicasModalOpen(true);
                  if (action === 'CP') {
                    await addCP();
                    showToast('Compensatorio agregado correctamente', 'success');
                  }
                  if (action === 'Susp/Lic') {
                    await addSuspension();
                    showToast('Susp/Lic agregada correctamente', 'info');
                  }
                  if (action === 'Incapacidad') {
                    await addIncapacidad();
                    showToast('Incapacidad agregada correctamente', 'info');
                  }
                  if (action === 'Dispo') setDispoModalOpen(true);
                  if (action === 'Reset') {
                    await resetPayroll();
                    showToast('Nómina reseteada a valores básicos', 'success');
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN REGISTROS */}
        <section>
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">Registros de Turnos</h2>
          <ShiftTable shifts={shifts} />
        </section>

        {/* SECCIÓN RESULTADO */}
        <section>
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">Colilla de Pago</h2>
          <PayrollSlip />
        </section>

        <Footer />
      </div>

      <ExtrasModal
        open={modalType !== null}
        mode={modalType ?? 'extras'}
        title={modalType === 'deduccion' ? 'Agregar Deducción' : 'Agregar Horas Extras'}
        onClose={() => setModalType(null)}
        onSuccess={(mode) => {
          if (mode === 'deduccion') {
            showToast('Deducción agregada correctamente', 'success');
            return;
          }
          showToast('Horas extras agregadas correctamente', 'success');
        }}
      />

      <DispoModal
        open={dispoModalOpen}
        onClose={() => setDispoModalOpen(false)}
        onSubmit={async (data) => {
          await addDispo(data);
        }}
        onSuccess={() => showToast('Tiempo disponible agregado correctamente', 'success')}
      />

      <CivicasModal
        open={civicasModalOpen}
        onOpenChange={setCivicasModalOpen}
      />

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
