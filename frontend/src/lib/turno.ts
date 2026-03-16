/**
 * Representa un turno (código) cargado desde turnos.json.
 * 
 * Espera un objeto con:
 * - codigo: string
 * - descripcion: string (opcional)
 * - hora_inicio / hora_fin: string en formato HH:MM
 * - festivo: boolean (true si dominical/festivo)
 */
export interface ITurno {
  codigo: string;
  descripcion?: string;
  hora_inicio: string;
  hora_fin: string;
  festivo: boolean;
}

export class Turno {
  private static readonly HORA_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  codigo: string;
  descripcion?: string;
  inicio: string; // HH:MM
  fin: string; // HH:MM
  festivo: boolean;

  constructor(data: ITurno) {
    this.codigo = this.validarCodigo(data.codigo);
    this.descripcion = data.descripcion;
    this.inicio = this.validarHora(data.hora_inicio, 'hora_inicio');
    this.fin = this.validarHora(data.hora_fin, 'hora_fin');
    this.festivo = data.festivo;
  }

  /**
   * Valida que el código de turno no esté vacío
   */
  private validarCodigo(codigo: string): string {
    if (!codigo || codigo.trim().length === 0) {
      throw new Error('Código de turno no puede estar vacío');
    }
    return codigo.trim();
  }

  /**
   * Valida que la hora tenga formato HH:MM correcto
   */
  private validarHora(hora: string, campo: string): string {
    if (!Turno.HORA_REGEX.test(hora)) {
      throw new Error(
        `${campo} tiene formato inválido "${hora}". Debe ser HH:MM (ej: 06:30, 23:59)`
      );
    }
    return hora;
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
