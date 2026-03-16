/**
 * Interfaz que representa un turno de trabajo.
 * Contiene información del cuarto donde se trabajó, horarios e información de festividad.
 */
export interface Turno {
  codigo: string;              // Código único del turno (ej: "250M")
  descripcion?: string;        // Descripción legible del turno (opcional)
  hora_inicio: string;         // Hora de inicio en formato HH:MM
  hora_fin: string;            // Hora de finalización en formato HH:MM
  festivo: boolean;            // Indica si es día festivo
  inicio?: string;             // Alternativa para hora_inicio
  fin?: string;                // Alternativa para hora_fin
  horas: number;               // Total de horas del turno
  valor: number;               // Valor base del turno
  tipo?: string;               // Tipo de turno
}

/**
 * Interfaz simplificada de un turno con solo horarios.
 * @deprecated Usar Turno en su lugar
 */
export interface Shift {
  codigo: string;
  inicio: string;
  fin: string;
}

/**
 * Respuesta del cálculo de nómina enviada por el API.
 * Incluye totales y desglose detallado de devengados y deducciones.
 */
export interface PayrollResponse {
  devengado: number;                              // Total devengado (sin deducciones)
  auxilio: number;                                // Auxilio de transporte
  civicas: number;                                // Valor de cívicas/pasajes
  deducciones: number;                            // Total de deducciones (salud + pensión)
  neto: number;                                   // Neto = devengado + civicas - deducciones
  desglose_devengados: Record<string, number | string>; // Detalle: salario, recargos, extras
  desglose_deducciones: Record<string, number>;   // Detalle: salud, pensión
  dias_trabajados: number;                        // Días trabajados en la quincena
  turnos_count: number;                           // Cantidad de turnos procesados
}
