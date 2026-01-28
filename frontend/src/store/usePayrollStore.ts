import { create } from 'zustand';
import type { Shift, Turno } from '@/lib/types';
import { calcularNomina, fetchTurnos, agregarCP, agregarSuspension, agregarLicencia, agregarIncapacidad, agregarDispo } from '@/lib/api';

interface PayrollState {
  quincena: string;
  shifts: Shift[];
  turnosDisponibles: Turno[];
  eventos: Array<{ tipo: string; codigo: string; inicio: string; fin: string; detalles: string }>;
  devengado: number;
  deducciones: number;
  neto: number;
  auxilio: number;
  civicas: number;
  desgloseDevengados: Record<string, number | string>;
  desgloseDeducciones: Record<string, number>;
  diasTrabajados: number;

  setQuincena: (q: string) => void;
  loadTurnos: () => Promise<void>;
  addShift: (shift: Shift) => void;
  removeShift: (index: number) => void;
  clearAll: () => void;
  calculatePayroll: () => Promise<void>;
  addCP: () => Promise<void>;
  addSuspension: () => Promise<void>;
  addLicencia: () => Promise<void>;
  addIncapacidad: () => Promise<void>;
  addDispo: (data: { inicio: string; fin: string; festivo: boolean }) => Promise<void>;
  addEvento: (evento: { tipo: string; codigo: string; inicio: string; fin: string; detalles: string }) => void;
  removeEvento: (index: number) => void;
  resetPayroll: () => Promise<void>;
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  quincena: '30',
  shifts: [],
  turnosDisponibles: [],
  eventos: [],
  devengado: 0,
  deducciones: 0,
  neto: 0,
  auxilio: 0,
  civicas: 0,
  desgloseDevengados: {},
  desgloseDeducciones: {},
  diasTrabajados: 0,

  setQuincena: (q) => set({ quincena: q }),

  loadTurnos: async () => {
    try {
      const turnos = await fetchTurnos();
      set({ turnosDisponibles: turnos });
    } catch (error) {
      console.error('Error cargando turnos:', error);
    }
  },

  addShift: (shift) => {
    const { turnosDisponibles } = get();
    const turnoCompleto = turnosDisponibles.find(t => t.codigo === shift.codigo);
    const shiftConHoras = {
      ...shift,
      inicio: (turnoCompleto?.hora_inicio || shift.inicio)?.slice(0, 5) || '',
      fin: (turnoCompleto?.hora_fin || shift.fin)?.slice(0, 5) || ''
    };
    set((state) => ({ shifts: [...state.shifts, shiftConHoras] }));
    void get().calculatePayroll();
  },

  removeShift: (index) => {
    set((state) => ({
      shifts: state.shifts.filter((_, i) => i !== index),
    }));
    void get().calculatePayroll();
  },

  clearAll: () =>
    set({
      shifts: [],
      eventos: [],
      devengado: 0,
      deducciones: 0,
      neto: 0,
      auxilio: 0,
      civicas: 0,
      desgloseDevengados: {},
      desgloseDeducciones: {},
      diasTrabajados: 0,
    }),

  calculatePayroll: async () => {
    const { quincena, shifts } = get();
    const codigos = shifts.map((s) => s.codigo);

    try {
      const data = await calcularNomina(quincena, codigos);
      set({
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
      });
    } catch (error) {
      console.error('Error calculando:', error);
    }
  },

  addCP: async () => {
    const { quincena, shifts } = get();
    const codigos = shifts.map((s) => s.codigo);
    try {
      const data = await agregarCP(quincena, codigos);
      // Add CP to eventos
      get().addEvento({
        tipo: 'CP',
        codigo: 'CP',
        inicio: '-',
        fin: '-',
        detalles: '6h base'
      });
      set({
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
      });
    } catch (error) {
      console.error('Error agregando CP:', error);
    }
  },

  addSuspension: async () => {
    const { quincena, shifts } = get();
    const codigos = shifts.map((s) => s.codigo);
    try {
      const data = await agregarSuspension(quincena, codigos);
      // Add Suspensión to eventos
      get().addEvento({
        tipo: 'Suspensión',
        codigo: 'SUSP',
        inicio: '-',
        fin: '-',
        detalles: 'Sin pago'
      });
      set((state) => ({
        ...state,
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
      }));
    } catch (error) {
      console.error('Error agregando suspensión:', error);
    }
  },

  addLicencia: async () => {
    const { quincena, shifts } = get();
    const codigos = shifts.map((s) => s.codigo);
    try {
      const data = await agregarLicencia(quincena, codigos);
      // Add Licencia to eventos
      get().addEvento({
        tipo: 'Licencia',
        codigo: 'LIC',
        inicio: '-',
        fin: '-',
        detalles: 'No remunerada'
      });
      set((state) => ({
        ...state,
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
      }));
    } catch (error) {
      console.error('Error agregando licencia:', error);
    }
  },

  addIncapacidad: async () => {
    const { quincena, shifts } = get();
    const codigos = shifts.map((s) => s.codigo);
    try {
      const data = await agregarIncapacidad(quincena, codigos);
      // Add Incapacidad to eventos
      get().addEvento({
        tipo: 'Incapacidad',
        codigo: 'INCAP',
        inicio: '-',
        fin: '-',
        detalles: '66.67% pago'
      });
      set((state) => ({
        ...state,
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
      }));
    } catch (error) {
      console.error('Error agregando incapacidad:', error);
    }
  },

  addDispo: async (data) => {
    try {
      await agregarDispo(data.inicio, data.fin, data.festivo);
      // Add DISPO to eventos with formatted hours
      get().addEvento({
        tipo: 'DISPO',
        codigo: 'DISPO',
        inicio: data.inicio.slice(0, 5),
        fin: data.fin.slice(0, 5),
        detalles: `Tiempo disponible${data.festivo ? ' (festivo)' : ''}`
      });
      // Recalculate payroll after adding DISPO
      await get().calculatePayroll();
    } catch (error) {
      console.error('Error agregando DISPO:', error);
    }
  },

  addEvento: (evento) => {
    set((state) => ({
      eventos: [...state.eventos, evento]
    }));
  },

  removeEvento: (index) => {
    set((state) => ({
      eventos: state.eventos.filter((_, i) => i !== index)
    }));
    // Recalculate payroll after removing evento
    void get().calculatePayroll();
  },

  resetPayroll: async () => {
    const { quincena } = get();
    try {
      // Reset to basic values only
      const data = await calcularNomina(quincena, []);
      
      set({
        devengado: data.devengado,
        deducciones: data.deducciones,
        neto: data.neto,
        auxilio: data.auxilio,
        civicas: data.civicas,
        desgloseDevengados: {
          salario_basico: data.desglose_devengados.salario_basico,
          civicas: data.desglose_devengados.civicas,
          auxilio: data.desglose_devengados.auxilio,
        },
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
        // Clear all shifts and eventos
        shifts: [],
        eventos: [],
      });
    } catch (error) {
      console.error('Error reseteando nómina:', error);
    }
  },
}));
