import { create } from 'zustand';
import type { Shift, Turno } from '@/lib/types';
import { calcularNomina, calcularNominaConEventos, fetchTurnos } from '@/lib/api';

interface PayrollState {
  quincena: string;
  shifts: Shift[];
  turnosDisponibles: Turno[];
  eventos: Array<{ tipo: string; codigo: string; inicio: string; fin: string; detalles: string }>;
  extras: Array<{ minutos: number; recargo: number; nombre: string }>;
  deduccionesManuals: Array<{ nombre: string; valor: number }>;
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
  addExtra: (minutos: number, recargo: number, nombre: string) => Promise<void>;
  addDeduccion: (nombre: string, valor: number) => Promise<void>;
  removeExtra: (index: number) => Promise<void>;
  removeDeduccion: (index: number) => Promise<void>;
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
  extras: [],
  deduccionesManuals: [],
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
    console.log('[addShift] Agregando shift:', shift);
    const { turnosDisponibles } = get();
    const turnoCompleto = turnosDisponibles.find(t => t.codigo === shift.codigo);
    const shiftConHoras = {
      ...shift,
      inicio: (turnoCompleto?.hora_inicio || shift.inicio)?.slice(0, 5) || '',
      fin: (turnoCompleto?.hora_fin || shift.fin)?.slice(0, 5) || ''
    };
    console.log('[addShift] Shift con horas:', shiftConHoras);
    set((state) => {
      console.log('[addShift] Estado anterior - shifts:', state.shifts.length);
      const newState = { shifts: [...state.shifts, shiftConHoras] };
      console.log('[addShift] Estado nuevo - shifts:', newState.shifts.length);
      return newState;
    });
    // Usar setTimeout para asegurar que el estado se actualiza antes de calcular
    setTimeout(() => {
      const currentState = get();
      console.log('[addShift] Después de setTimeout - shifts en el state:', currentState.shifts.length);
      void currentState.calculatePayroll();
    }, 0);
  },

  removeShift: (index) => {
    set((state) => ({
      shifts: state.shifts.filter((_, i) => i !== index),
    }));
    // Usar setTimeout para asegurar que el estado se actualiza antes de calcular
    setTimeout(() => {
      void get().calculatePayroll();
    }, 0);
  },

  clearAll: () =>
    set({
      shifts: [],
      eventos: [],
      extras: [],
      deduccionesManuals: [],
      devengado: 0,
      deducciones: 0,
      neto: 0,
      auxilio: 0,
      civicas: 0,
      desgloseDevengados: {},
      desgloseDeducciones: {},
      diasTrabajados: 0,
    }),

  addExtra: async (minutos, recargo, nombre) => {
    set((state) => ({
      extras: [...state.extras, { minutos, recargo, nombre }],
    }));
    await get().calculatePayroll();
  },

  addDeduccion: async (nombre, valor) => {
    set((state) => ({
      deduccionesManuals: [...state.deduccionesManuals, { nombre, valor }],
    }));
    await get().calculatePayroll();
  },

  removeExtra: async (index) => {
    set((state) => ({
      extras: state.extras.filter((_, i) => i !== index),
    }));
    await get().calculatePayroll();
  },

  removeDeduccion: async (index) => {
    set((state) => ({
      deduccionesManuals: state.deduccionesManuals.filter((_, i) => i !== index),
    }));
    await get().calculatePayroll();
  },

  calculatePayroll: async () => {
    const { quincena, shifts, eventos, extras, deduccionesManuals } = get();
    const codigos = shifts.map((s) => s.codigo);

    console.log('[calculatePayroll] Iniciando cálculo', { quincena, codigos, eventosCount: eventos.length, extrasCount: extras.length, deduccionesCount: deduccionesManuals.length });

    try {
      // Construir lista de eventos incluyendo los que vienen del estado
      const eventosAgrupados: Record<string, number> = {};
      eventos.forEach(e => {
        const tipo = e.tipo === 'Suspensión' ? 'suspension' : 
                     e.tipo === 'Licencia' ? 'licencia' :
                     e.tipo === 'Incapacidad' ? 'incapacidad' :
                     e.tipo === 'CP' ? 'cp' :
                     e.tipo === 'DISPO' ? 'dispo' :
                     e.tipo.toLowerCase();
        eventosAgrupados[tipo] = (eventosAgrupados[tipo] || 0) + 1;
      });
      
      // Construir lista de eventos para el backend incluyendo extras y deducciones
      const eventosParaBackend: any[] = Object.entries(eventosAgrupados).map(([tipo, cantidad]) => ({
        tipo,
        cantidad
      }));
      
      // Agregar extras
      extras.forEach(extra => {
        eventosParaBackend.push({
          tipo: 'extra',
          minutos: extra.minutos,
          recargo: extra.recargo,
          nombre: extra.nombre,
        });
      });
      
      // Agregar deducciones
      deduccionesManuals.forEach(deduccion => {
        eventosParaBackend.push({
          tipo: 'deduccion',
          nombre: deduccion.nombre,
          valor: deduccion.valor,
        });
      });
      
      // Si hay eventos o extras o deducciones, usar calcularNominaConEventos
      if (eventosParaBackend.length > 0) {
        console.log('[calculatePayroll] Llamando a calcularNominaConEventos', { quincena, codigos, eventosCount: eventosParaBackend.length });
        const data = await calcularNominaConEventos(quincena, codigos, eventosParaBackend);
        console.log('[calculatePayroll] Respuesta de calcularNominaConEventos:', data);
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
      } else {
        console.log('[calculatePayroll] Llamando a calcularNomina sin eventos', { quincena, codigos });
        const data = await calcularNomina(quincena, codigos);
        console.log('[calculatePayroll] Respuesta de calcularNomina:', data);
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
      }
    } catch (error) {
      console.error('[calculatePayroll] Error calculando:', error);
      if (error instanceof Error) {
        console.error('[calculatePayroll] Error message:', error.message);
      }
    }
  },

  addCP: async () => {
    try {
      get().addEvento({
        tipo: 'CP',
        codigo: 'CP',
        inicio: '-',
        fin: '-',
        detalles: 'Compensatorio'
      });
      await get().calculatePayroll();
    } catch (error) {
      console.error('Error agregando CP:', error);
      set((state) => ({
        eventos: state.eventos.filter((e) => e.tipo !== 'CP')
      }));
    }
  },

  addSuspension: async () => {
    try {
      get().addEvento({
        tipo: 'Suspensión',
        codigo: 'SUSP',
        inicio: '-',
        fin: '-',
        detalles: 'Sin pago'
      });
      await get().calculatePayroll();
    } catch (error) {
      console.error('Error agregando suspensión:', error);
      set((state) => ({
        eventos: state.eventos.filter((e) => e.tipo !== 'Suspensión')
      }));
    }
  },

  addLicencia: async () => {
    try {
      get().addEvento({
        tipo: 'Licencia',
        codigo: 'LIC',
        inicio: '-',
        fin: '-',
        detalles: 'No remunerada'
      });
      await get().calculatePayroll();
    } catch (error) {
      console.error('Error agregando licencia:', error);
      set((state) => ({
        eventos: state.eventos.filter((e) => e.tipo !== 'Licencia')
      }));
    }
  },

  addIncapacidad: async () => {
    try {
      get().addEvento({
        tipo: 'Incapacidad',
        codigo: 'INCAP',
        inicio: '-',
        fin: '-',
        detalles: '66.67% pago'
      });
      await get().calculatePayroll();
    } catch (error) {
      console.error('Error agregando incapacidad:', error);
      set((state) => ({
        eventos: state.eventos.filter((e) => e.tipo !== 'Incapacidad')
      }));
    }
  },

  addDispo: async (data) => {
    try {
      // Agregar DISPO a eventos
      get().addEvento({
        tipo: 'DISPO',
        codigo: 'DISPO',
        inicio: data.inicio.slice(0, 5),
        fin: data.fin.slice(0, 5),
        detalles: `Tiempo disponible${data.festivo ? ' (festivo)' : ''}`
      });
      
      // Recalcular la nómina completa (incluye extras, deducciones, eventos y DISPO)
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
    const { calculatePayroll } = get();
    void calculatePayroll();
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
        desgloseDevengados: data.desglose_devengados,
        desgloseDeducciones: data.desglose_deducciones,
        diasTrabajados: data.dias_trabajados,
        // Clear all shifts and eventos
        shifts: [],
        eventos: [],
        extras: [],
        deduccionesManuals: [],
      });
    } catch (error) {
      console.error('Error reseteando nómina:', error);
    }
  },
}));
