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

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
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
