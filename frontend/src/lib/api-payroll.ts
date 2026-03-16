import { NextResponse } from 'next/server';
import { PayrollCalculator } from '@/lib/calculadora-v2';
import { Turno, type ITurno } from '@/lib/turno';
import turnosData from '@/lib/turnos-data';
import { validarCodigosTurnos, type Evento } from '@/lib/validation';

export type BuildCalculatorResult =
  | { ok: true; calc: PayrollCalculator; turnoCount: number }
  | { ok: false; response: NextResponse };

/**
 * Construye la calculadora y agrega turnos validados.
 * Mantiene mensajes de error compatibles con API v1 actual.
 */
export function buildCalculatorFromTurnos(quincena: string, turnos: string[]): BuildCalculatorResult {
  const codigosDisponibles = turnosData.map((t) => t.codigo);
  const codigosInvalidos = validarCodigosTurnos(turnos, codigosDisponibles);

  if (codigosInvalidos.length > 0) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Códigos de turno no válidos',
          detalles: codigosInvalidos,
        },
        { status: 400 }
      ),
    };
  }

  const calc = new PayrollCalculator(quincena);
  let turnoCount = 0;

  for (const codigo of turnos) {
    const turnoData = turnosData.find((t) => t.codigo === codigo);
    if (!turnoData) {
      continue;
    }

    try {
      const turno = new Turno(turnoData as ITurno);
      calc.agregarTurno(turno);
      turnoCount++;
    } catch (error) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            success: false,
            error: `Error al procesar turno ${codigo}`,
            detalle: error instanceof Error ? error.message : 'Error desconocido',
          },
          { status: 400 }
        ),
      };
    }
  }

  return { ok: true, calc, turnoCount };
}

/**
 * Procesa un evento y lo agrega a la calculadora.
 */
export function procesarEvento(calc: PayrollCalculator, evento: Evento): void {
  const { tipo } = evento;

  switch (tipo) {
    case 'incapacidad':
      if (!evento.cantidad || evento.cantidad < 1) {
        throw new Error('Incapacidad requiere cantidad >= 1');
      }
      calc.agregarIncapacidad(evento.cantidad);
      break;

    case 'suspension':
      if (!evento.cantidad || evento.cantidad < 1) {
        throw new Error('Suspensión requiere cantidad >= 1');
      }
      calc.agregarSuspension(evento.cantidad);
      break;

    case 'licencia':
      if (!evento.cantidad || evento.cantidad < 1) {
        throw new Error('Licencia requiere cantidad >= 1');
      }
      calc.agregarLicencia(evento.cantidad);
      break;

    case 'cp':
      calc.agregarCP();
      break;

    case 'extra':
      if (!evento.minutos || evento.minutos < 1) {
        throw new Error('Extra requiere minutos >= 1');
      }
      calc.agregarExtra(evento.minutos, evento.recargo || 0, evento.nombre || `Extra ${evento.minutos}min`);
      break;

    case 'deduccion':
      if (!evento.nombre || !evento.valor || evento.valor <= 0) {
        throw new Error('Deducción requiere nombre y valor > 0');
      }
      calc.agregarDeduccion(evento.nombre, evento.valor);
      break;

    case 'dispo':
      if (!evento.inicio || !evento.fin) {
        throw new Error('Dispo requiere inicio y fin (HH:MM)');
      }
      procesarDispo(calc, evento.inicio, evento.fin, evento.festivo || false);
      break;

    default:
      throw new Error(`Tipo de evento no soportado: ${tipo}`);
  }
}

/**
 * Procesa un evento DISPO como turno sintético.
 */
export function procesarDispo(calc: PayrollCalculator, inicio: string, fin: string, festivo: boolean): void {
  const dispoTurno: ITurno = {
    codigo: 'DISPO',
    hora_inicio: inicio,
    hora_fin: fin,
    festivo,
  };

  try {
    const turno = new Turno(dispoTurno);
    calc.agregarTurno(turno);
  } catch (error) {
    throw new Error(`Error procesando DISPO: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
