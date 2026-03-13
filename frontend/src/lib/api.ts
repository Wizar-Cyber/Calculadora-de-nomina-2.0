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
 */

import axios from 'axios';
import type { PayrollResponse, Turno } from './types';

/**
 * Interfaz para eventos especiales en el cálculo de nómina.
 * Soporta: suspensiones, licencias, incapacidades, paños de día/pago, horas extras, deducciones manuales.
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
 * Intenta cargar primero desde la API, si falla intenta desde /turnos.json
 * 
 * @returns Promise<Turno[]> - Array con todos los turnos disponibles
 * @throws Error si ambas ruentes fallan
 */
export async function fetchTurnos(): Promise<Turno[]> {
  try {
    // Intentar primera la ruta API
    const response = await api.get('/turnos');
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
 * Calcula nómina básica para los turnos especificados.
 * 
 * Procesa solo turnos sin eventos especiales.
 * 
 * @param quincena - Identificador de la quincena (ej: "2024-01")
 * @param turnos - Array de códigos de turnos a procesar (ej: ["250M", "251M"])
 * @returns Promise<PayrollResponse> - Resultado con devengado, deducciones y neto
 */
export async function calcularNomina(quincena: string, turnos: string[]) {
  const response = await api.post<PayrollResponse>('/calcular', {
    quincena,
    turnos,
  });
  return response.data;
}

/**
 * Calcula nómina con eventos especiales.
 * 
 * Permite incluir suspensiones, licencias, incapacidades, horas extras, 
 * deducciones manuales, etc.
 * 
 * @param quincena - Identificador de la quincena
 * @param turnos - Array de códigos de turnos base
 * @param eventos - Array de eventos especiales a aplicar
 * @returns Promise<PayrollResponse> - Resultado incluyendo impacto de eventos
 */
export async function calcularNominaConEventos(quincena: string, turnos: string[], eventos: Evento[]) {
  const response = await api.post<PayrollResponse>('/calcular-con-eventos', {
    quincena,
    turnos,
    eventos,
  });
  return response.data;
}
