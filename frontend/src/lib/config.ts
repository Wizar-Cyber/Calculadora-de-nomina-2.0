/**
 * Constantes y parámetros de negocio para el cálculo de nómina.
 */

// ----------------------------
// SALARIO / JORNADA
// ----------------------------
export const SALARIO_BASICO_MENSUAL = 2626357;
export const SALARIO_QUINCENA = SALARIO_BASICO_MENSUAL / 2;
export const HORAS_JORNADA = 6;
export const VALOR_HORA = 14590.87222; // Salario / 30 / 6
export const VALOR_MINUTO = VALOR_HORA / 60;

// ----------------------------
// AUXILIO / CÍVICAS
// ----------------------------
export const AUXILIO_TRANSPORTE = 249095; // Mensual
export const PASAJES_CIVICA_CANTIDAD = 24;
export const PASAJES_CIVICA_VALOR = 3820;

// ----------------------------
// DEDUCCIONES
// ----------------------------
export const DEDUCCIONES_BASE = {
  Salud: 0.04,
  Pensión: 0.04,
};

// ----------------------------
// RECARGOS
// ----------------------------
// Porcentajes de recargo (se suman al valor hora base)
export const RECARGO_ORDINARIO_NOCTURNO = 0.35; // +35%
export const RECARGO_DOMINICAL_DIURNO = 0.8; // +80%
export const RECARGO_DOMINICAL_NOCTURNO = 2.1; // +210%

export const FRANJA_DIURNA = [6, 19]; // 6:00 AM - 7:00 PM
export const FRANJA_NOCTURNA = [19, 6]; // 7:00 PM - 6:00 AM
