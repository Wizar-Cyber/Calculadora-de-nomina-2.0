/**
 * Utilidades para cálculos monetarios con precisión.
 * 
 * Usa centavos (números enteros) para evitar errores de punto flotante.
 * 
 * Ejemplo:
 *   5.33 horas * $13041.81/hora = $69,533.25
 *   En centavos: 533 * 1304181 / 100 = 6953325 centavos = $69,533.25
 */

/**
 * Convierte pesos a centavos (número entero)
 */
export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Convierte centavos a pesos
 */
export function centavosToPesos(centavos: number): number {
  return Math.round(centavos) / 100;
}

/**
 * Multiplica dos valores en centavos manteniendo precisión
 */
export function multiplicarCentavos(centavos: number, multiplicador: number): number {
  return Math.round(centavos * multiplicador);
}

/**
 * Suma valores en centavos (evita pérdida de precisión)
 */
export function sumarCentavos(...valores: number[]): number {
  return valores.reduce((sum, val) => sum + Math.round(val), 0);
}

/**
 * Aplica un porcentaje a un valor en centavos
 * 
 * @param centavos - Valor en centavos
 * @param porcentaje - Porcentaje (ej: 35 para 35%)
 * @returns Valor resultante en centavos
 * 
 * @example
 * aplicarPorcentaje(1000000, 35) // 1M centavos + 35% = 1.35M centavos
 */
export function aplicarPorcentaje(centavos: number, porcentaje: number): number {
  return Math.round(centavos + (centavos * porcentaje) / 100);
}

/**
 * Reduce un valor en centavos por un porcentaje
 * 
 * @example
 * reducirPorPorcentaje(1000000, 4) // 1M centavos - 4% = 0.96M centavos
 */
export function reducirPorcentaje(centavos: number, porcentaje: number): number {
  return Math.round(centavos * (1 - porcentaje / 100));
}

/**
 * Divide un valor en centavos entre un divisor manteniendo precisión
 * 
 * @example
 * dividirCentavos(1500000, 60) // 1500000 centavos / 60 minutos = 25000 centavos/minuto
 */
export function dividirCentavos(centavos: number, divisor: number): number {
  return Math.round(centavos / divisor);
}

/**
 * Calcula horas * valor hora en centavos con precisión
 * 
 * @param horas - Cantidad de horas (puede ser decimal: 5.33)
 * @param valorHoraCentavos - Valor por hora en centavos
 * @returns Total en centavos
 * 
 * @example
 * calcularValorHoras(5.33, 1304181)
 * = Math.round(533 minutos * 1304181 centavos/60 minutos)
 * = 6953325 centavos = $69,533.25
 */
export function calcularValorHoras(horas: number, valorHoraCentavos: number): number {
  const minutos = Math.round(horas * 60);
  const valorMinutoCentavos = dividirCentavos(valorHoraCentavos, 60);
  return multiplicarCentavos(minutos, valorMinutoCentavos);
}

/**
 * Redondea un valor de centavos al peso más cercano
 */
export function redondearCentavos(centavos: number): number {
  return Math.round(centavos / 100) * 100;
}
