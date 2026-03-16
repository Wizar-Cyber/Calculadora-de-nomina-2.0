/**
 * Cliente Axios para comunicación con el backend de cálculo de nómina.
 * 
 * Proporciona funciones para:
 * - Obtener lista de turnos disponibles
 * - Calcular nómina básica (solo turnos)
 * - Calcular nómina con eventos especiales (suspensiones, licencias, etc.)
 * 
 * URL base configurada por variable de entorno NEXT_PUBLIC_API_BASE_URL
 * Default: /api (rutas locales de Next.js)
 * 
 * Versión: v1 (API con validación robusta y precisión mejorada)
 */

import axios from 'axios';
import type { PayrollResponse, Turno } from './types';

/**
 * Interfaz para eventos especiales en el cálculo de nómina.
 * Soporta: suspensiones, licencias, incapacidades, CP, horas extras, deducciones manuales, disponible.
 */
interface Evento {
  tipo: string;              // Tipo: "suspension", "licencia", "incapacidad", "cp", "dispo", "extra", "deduccion"
  cantidad?: number;         // Cantidad de días (suspension, licencia, incapacidad)
  minutos?: number;          // Minutos trabajados (extra)
  recargo?: number;          // Porcentaje de recargo (extra)
  nombre?: string;           // Nombre del concepto (extra, deduccion)
  valor?: number;            // Valor en pesos (deduccion)
  inicio?: string;           // Hora inicio HH:MM (dispo)
  fin?: string;              // Hora fin HH:MM (dispo)
  festivo?: boolean;         // Si es festivo (dispo)
}

// ============================================================
// CONFIGURACIÓN DE CONEXIÓN AL BACKEND
// ============================================================
// Usa variable de entorno NEXT_PUBLIC_API_BASE_URL
// Default: /api (rutas locales de Next.js en desarrollo)
// En producción: puede ser una URL externa
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: false,
});

/**
 * Obtiene la lista de todos los turnos disponibles.
 * 
 * Intenta cargar primero desde la API v1, si falla intenta desde /turnos.json
 * 
 * @returns Promise<Turno[]> - Array con todos los turnos disponibles
 * @throws Error si ambas fuentes fallan
 */
export async function fetchTurnos(): Promise<Turno[]> {
  try {
    // Intentar primero la ruta API v1
    const response = await api.get('/v1/turnos');
    return response.data.turnos as Turno[];
  } catch (error) {
    // Si falla, cargar directamente desde public
    try {
      const response = await fetch('/turnos.json');
      if (!response.ok) throw new Error('Failed to fetch turnos');
      return (await response.json()) as Turno[];
    } catch (fallbackError) {
      console.error('Failed to fetch turnos from both sources:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Calcula nómina básica para los turnos especificados (API v1).
 * 
 * Procesa solo turnos sin eventos especiales.
 * Ahora incluye soporte para civicas (pasajes adicionales).
 * 
 * @param quincena - Identificador de la quincena (ej: "15" o "30")
 * @param turnos - Array de códigos de turnos a procesar (ej: ["250M", "251M"])
 * @param civicas - Cantidad de pasajes/civicas a agregar (default: 0)
 * @returns Promise<PayrollResponse> - Resultado con devengado, deducciones y neto
 */
export async function calcularNomina(quincena: string, turnos: string[], civicas: number = 0) {
  const response = await api.post<{ success: boolean; data: PayrollResponse }>('/v1/calcular', {
    quincena,
    turnos,
    civicas,
  });

  return response.data.data;
}

/**
 * Calcula nómina con eventos especiales (API v1).
 * 
 * Permite incluir suspensiones, licencias, incapacidades, horas extras, 
 * deducciones manuales, disponibles, etc.
 * 
 * @param quincena - Identificador de la quincena
 * @param turnos - Array de códigos de turnos base
 * @param eventos - Array de eventos especiales a aplicar
 * @param civicas - Cantidad de pasajes/civicas a agregar (default: 0)
 * @returns Promise<PayrollResponse> - Resultado incluyendo impacto de eventos
 */
export async function calcularNominaConEventos(
  quincena: string,
  turnos: string[],
  eventos: Evento[],
  civicas: number = 0
) {
  const response = await api.post<{ success: boolean; data: PayrollResponse }>('/v1/calcular-con-eventos', {
    quincena,
    turnos,
    eventos,
    civicas,
  });

  return response.data.data;
}
