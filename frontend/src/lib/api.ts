import axios from 'axios';
import type { PayrollResponse, Turno } from './types';

interface Evento {
  tipo: string;
  cantidad?: number;
  minutos?: number;
  recargo?: number;
  nombre?: string;
  valor?: number;
  inicio?: string;
  fin?: string;
  festivo?: boolean;
}

// Usar variable de entorno o localhost como fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://nomina-backend-78t7.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: false,
});

export async function fetchTurnos(): Promise<Turno[]> {
  const response = await api.get('/turnos');
  return response.data.turnos as Turno[];
}

export async function calcularNomina(quincena: string, turnos: string[]) {
  const response = await api.post<PayrollResponse>('/calcular', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function calcularNominaConEventos(quincena: string, turnos: string[], eventos: Evento[]) {
  const response = await api.post<PayrollResponse>('/calcular-con-eventos', {
    quincena,
    turnos,
    eventos,
  });
  return response.data;
}
