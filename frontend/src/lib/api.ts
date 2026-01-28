import axios from 'axios';
import type { PayrollResponse, Turno } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchTurnos(): Promise<Turno[]> {
  const response = await api.get('/api/turnos');
  return response.data.turnos as Turno[];
}

export async function calcularNomina(quincena: string, turnos: string[]) {
  const response = await api.post<PayrollResponse>('/api/calcular', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function agregarExtra(minutos: number, recargo: number, nombre: string) {
  const response = await api.post('/api/eventos/extra', {
    minutos,
    recargo,
    nombre,
  });
  return response.data;
}

export async function agregarDeduccion(nombre: string, valor: number) {
  const response = await api.post('/api/eventos/deduccion', {
    nombre,
    valor,
  });
  return response.data;
}

export async function agregarCP(quincena: string, turnos: string[]) {
  const response = await api.post('/api/eventos/cp', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function agregarSuspension(quincena: string, turnos: string[]) {
  const response = await api.post('/api/eventos/suspension', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function agregarLicencia(quincena: string, turnos: string[]) {
  const response = await api.post('/api/eventos/licencia', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function agregarIncapacidad(quincena: string, turnos: string[]) {
  const response = await api.post('/api/eventos/incapacidad', {
    quincena,
    turnos,
  });
  return response.data;
}

export async function agregarDispo(inicio: string, fin: string, festivo: boolean) {
  const response = await api.post('/api/eventos/dispo', {
    inicio,
    fin,
    festivo,
  });
  return response.data;
}
