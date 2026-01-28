'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DispoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { inicio: string; fin: string; festivo: boolean }) => Promise<void>;
}

const dispoSchema = z.object({
  inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM (24 horas)'),
  fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM (24 horas)'),
  festivo: z.boolean().default(false),
});

export function DispoModal({ open, onClose, onSubmit }: DispoModalProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof dispoSchema>>({
    resolver: zodResolver(dispoSchema),
    defaultValues: { inicio: '', fin: '', festivo: false },
  });

  const onFormSubmit = async (values: z.infer<typeof dispoSchema>) => {
    try {
      setErrorMessage(null);
      await onSubmit(values);
      setSuccessMessage('Tiempo disponible agregado.');
      reset();
      setTimeout(() => setSuccessMessage(null), 2000);
      onClose();
    } catch (error) {
      setErrorMessage('No se pudo agregar. Verifica conexión o intenta de nuevo.');
    }
  };

  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    reset();
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
                <h3 className="text-lg font-semibold">Agregar Tiempo Disponible</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Hora inicio (24h)
                  </label>
                  <Input 
                    type="text" 
                    placeholder="14:30"
                    {...register('inicio')} 
                  />
                  {errors.inicio && (
                    <p className="text-xs text-red-400">{errors.inicio.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Hora fin (24h)
                  </label>
                  <Input 
                    type="text" 
                    placeholder="22:45"
                    {...register('fin')} 
                  />
                  {errors.fin && (
                    <p className="text-xs text-red-400">{errors.fin.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="festivo"
                  {...register('festivo')}
                  className="h-4 w-4 rounded border-white/10 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <label htmlFor="festivo" className="text-sm text-white/80">
                  ¿Es día festivo?
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="secondary" type="button" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
                >
                  {isSubmitting ? 'Guardando...' : 'Agregar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
