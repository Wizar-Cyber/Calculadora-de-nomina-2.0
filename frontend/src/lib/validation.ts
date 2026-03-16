/**
 * Esquemas de validación con Zod para la API de nómina.
 */

import { z } from 'zod';

/**
 * Validador para formato HH:MM
 */
const HoraSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
  .describe('Hora en formato HH:MM (ej: 06:30)');

/**
 * Validador para quincena (15 o 30)
 */
const QuincenaSchema = z
  .enum(['15', '30'])
  .describe('Quincena: 15 (primera) o 30 (segunda)');

/**
 * Validador para código de turno
 */
const CodigoTurnoSchema = z
  .string()
  .min(1, 'Código de turno no puede estar vacío')
  .max(10, 'Código de turno demasiado largo')
  .describe('Código único del turno (ej: 250M, 150CC, 600TT)');

/**
 * Esquema para solicitud de cálculo básico
 */
export const CalculoRequestSchema = z.object({
  quincena: QuincenaSchema,
  turnos: z
    .array(CodigoTurnoSchema)
    .min(0, 'Turnos debe ser un array')
    .max(30, 'Máximo 30 turnos por solicitud'),
  civicas: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Cantidad de pasajes/cívicas a pagar'),
});

export type CalculoRequest = z.infer<typeof CalculoRequestSchema>;

/**
 * Esquema para eventos especiales
 */
const EventoSchema = z.object({
  tipo: z
    .enum(['suspension', 'licencia', 'incapacidad', 'cp', 'extra', 'deduccion', 'dispo'])
    .describe('Tipo de evento'),
  cantidad: z.number().int().min(1).optional().describe('Cantidad de días'),
  minutos: z.number().int().min(1).optional().describe('Duración en minutos (para extras)'),
  recargo: z.number().min(0).optional().describe('Porcentaje de recargo (para extras)'),
  nombre: z.string().optional().describe('Nombre del concepto'),
  valor: z.number().min(0).optional().describe('Valor en pesos (para deducciones)'),
  inicio: HoraSchema.optional().describe('Hora de inicio (para dispo)'),
  fin: HoraSchema.optional().describe('Hora de fin (para dispo)'),
  festivo: z.boolean().optional().describe('¿Es festivo? (para dispo)'),
});

export type Evento = z.infer<typeof EventoSchema>;

/**
 * Esquema para cálculo con eventos
 */
export const CalculoConEventosRequestSchema = z.object({
  quincena: QuincenaSchema,
  turnos: z
    .array(CodigoTurnoSchema)
    .min(0, 'Turnos debe ser un array')
    .max(30, 'Máximo 30 turnos por solicitud'),
  eventos: z
    .array(EventoSchema)
    .default([])
    .describe('Eventos especiales a aplicar'),
  civicas: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Cantidad de pasajes/cívicas a pagar'),
});

export type CalculoConEventosRequest = z.infer<typeof CalculoConEventosRequestSchema>;

/**
 * Valida que un código de turno exista en la lista
 */
export function validarCodigoTurno(codigo: string, codigosDIsponibles: string[]): boolean {
  return codigosDIsponibles.includes(codigo);
}

/**
 * Valida que los códigos de turnos existan
 */
export function validarCodigosTurnos(codigos: string[], codigosDisponibles: string[]): string[] {
  const invalidos = codigos.filter(c => !codigosDisponibles.includes(c));
  return invalidos;
}

/**
 * Convierte errores de Zod a un objeto amigable
 */
export function formatearErroresZod(error: z.ZodError) {
  return {
    error: 'Validación fallida',
    detalles: error.errors.map(e => ({
      campo: e.path.join('.'),
      mensaje: e.message,
      tipo: e.code,
    })),
  };
}
