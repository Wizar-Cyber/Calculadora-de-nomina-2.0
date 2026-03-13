/**
 * Representa un turno (código) cargado desde turnos.json.
 * 
 * Espera un objeto con:
 * - codigo: string
 * - descripcion: string
 * - hora_inicio / hora_fin: string en formato HH:MM
 * - festivo: boolean (true si dominical/festivo)
 */
export interface ITurno {
  codigo: string;
  descripcion: string;
  hora_inicio: string;
  hora_fin: string;
  festivo: boolean;
  descanso?: string[];
}

export class Turno {
  codigo: string;
  descripcion: string;
  inicio: string; // HH:MM
  fin: string; // HH:MM
  festivo: boolean;
  descanso: string[];

  constructor(data: ITurno) {
    this.codigo = data.codigo;
    this.descripcion = data.descripcion;
    this.inicio = data.hora_inicio;
    this.fin = data.hora_fin;
    this.festivo = data.festivo;
    this.descanso = data.descanso || [];
  }

  /**
   * Convierte "HH:MM" a Date (solo interesa la hora)
   */
  horaInicioObj(): Date {
    const [hours, minutes] = this.inicio.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Convierte "HH:MM" a Date (solo interesa la hora)
   */
  horaFinObj(): Date {
    const [hours, minutes] = this.fin.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
