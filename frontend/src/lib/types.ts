export interface Turno {
  codigo: string;
  descripcion: string;
  hora_inicio: string;
  hora_fin: string;
  descanso: any[];
  festivo: boolean;
  inicio?: string;
  fin?: string;
  horas: number;
  valor: number;
  tipo?: string;
}

export interface Shift {
  codigo: string;
  inicio: string;
  fin: string;
}

export interface PayrollResponse {
  devengado: number;
  auxilio: number;
  civicas: number;
  deducciones: number;
  neto: number;
  desglose_devengados: Record<string, number | string>;
  desglose_deducciones: Record<string, number>;
  dias_trabajados: number;
  turnos_count: number;
}
