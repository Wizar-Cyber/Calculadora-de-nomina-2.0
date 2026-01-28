'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { agregarDeduccion, agregarExtra } from '@/lib/api';
import { usePayrollStore } from '@/store/usePayrollStore';

interface ExtrasModalProps {
  open: boolean;
  mode?: 'extras' | 'deduccion';
  title?: string;
  onClose: () => void;
}

const RECARGOS = [
  { label: 'Extra Diurna (25%)', value: '0.25' },
  { label: 'Extra Nocturna (75%)', value: '0.75' },
  { label: 'Extra Diurna Festiva (105%)', value: '1.05' },
  { label: 'Extra Nocturna Festiva (155%)', value: '1.55' },
];

const extrasSchema = z.object({
  minutos: z.coerce.number().positive('Ingresa minutos válidos'),
  recargo: z.string().min(1, 'Selecciona un recargo'),
});

const deduccionSchema = z.object({
  concepto: z.string().min(2, 'Ingresa un concepto'),
  monto: z.coerce.number().positive('Ingresa un monto válido'),
});

export function ExtrasModal({
  open,
  mode = 'extras',
  title = 'Agregar Horas Extras',
  onClose,
}: ExtrasModalProps) {
  const isDeduccion = mode === 'deduccion';
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { calculatePayroll } = usePayrollStore();

  const extrasForm = useForm<z.infer<typeof extrasSchema>>({
    resolver: zodResolver(extrasSchema),
    defaultValues: { minutos: undefined, recargo: '' },
  });

  const deduccionForm = useForm<z.infer<typeof deduccionSchema>>({
    resolver: zodResolver(deduccionSchema),
    defaultValues: { concepto: '', monto: undefined },
  });

  const recargoValue = extrasForm.watch('recargo');

  const onSubmitExtras = async (values: z.infer<typeof extrasSchema>) => {
    try {
      setErrorMessage(null);
      await agregarExtra(values.minutos, Number(values.recargo), 'Horas extras');
      setSuccessMessage('Extras guardadas.');
      await calculatePayroll();
      extrasForm.reset();
      setTimeout(() => setSuccessMessage(null), 2000);
      onClose();
    } catch (error) {
      setErrorMessage('No se pudo guardar. Verifica conexión o intenta de nuevo.');
    }
  };

  const onSubmitDeduccion = async (values: z.infer<typeof deduccionSchema>) => {
    try {
      setErrorMessage(null);
      await agregarDeduccion(values.concepto, values.monto);
      setSuccessMessage('Deducción guardada.');
      await calculatePayroll();
      deduccionForm.reset();
      setTimeout(() => setSuccessMessage(null), 2000);
      onClose();
    } catch (error) {
      setErrorMessage('No se pudo guardar. Verifica conexión o intenta de nuevo.');
    }
  };

  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    extrasForm.reset();
    deduccionForm.reset();
    onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Clock className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={isDeduccion ? deduccionForm.handleSubmit(onSubmitDeduccion) : extrasForm.handleSubmit(onSubmitExtras)}
            >
              {successMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}
              {mode === 'extras' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Minutos de extras
                    </label>
                    <Input
                      type="number"
                      step="1"
                      placeholder="120"
                      {...extrasForm.register('minutos')}
                    />
                    {extrasForm.formState.errors.minutos && (
                      <p className="text-xs text-red-400">
                        {extrasForm.formState.errors.minutos.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Tipo de recargo
                    </label>
                    <Select
                      value={recargoValue as string}
                      onValueChange={(value: string) =>
                        extrasForm.setValue('recargo', value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECARGOS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {extrasForm.formState.errors.recargo && (
                      <p className="text-xs text-red-400">
                        {extrasForm.formState.errors.recargo.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Concepto
                    </label>
                    <Input placeholder="Ej: Préstamo" {...deduccionForm.register('concepto')} />
                    {deduccionForm.formState.errors.concepto && (
                      <p className="text-xs text-red-400">
                        {deduccionForm.formState.errors.concepto.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Monto
                    </label>
                    <Input type="number" placeholder="150000" {...deduccionForm.register('monto')} />
                    {deduccionForm.formState.errors.monto && (
                      <p className="text-xs text-red-400">
                        {deduccionForm.formState.errors.monto.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="secondary" type="button" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isDeduccion
                      ? deduccionForm.formState.isSubmitting
                      : extrasForm.formState.isSubmitting
                  }
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
                >
                  {isDeduccion
                    ? deduccionForm.formState.isSubmitting
                      ? 'Guardando...'
                      : 'Agregar'
                    : extrasForm.formState.isSubmitting
                      ? 'Guardando...'
                      : 'Agregar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
