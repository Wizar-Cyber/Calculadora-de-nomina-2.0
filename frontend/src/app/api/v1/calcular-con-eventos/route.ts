/**
 * API v1: Calcular nómina con eventos especiales
 * POST /api/v1/calcular-con-eventos
 *
 * Ejemplo de request:
 * {
 *   "quincena": "15" o "30",
 *   "turnos": ["250M", "251M"],
 *   "eventos": [
 *     {
 *       "tipo": "incapacidad",
 *       "cantidad": 2
 *     },
 *     {
 *       "tipo": "cp",
 *     },
 *     {
 *       "tipo": "dispo",
 *       "inicio": "06:00",
 *       "fin": "12:00",
 *       "festivo": false
 *     }
 *   ],
 *   "civicas": 5
 * }
 *
 * Cambios en v1:
 * - Manejo mejorado de DISPO con recargo según franja horaria
 * - Campo civicas para entrada manual del usuario
 * - Validación más robusta de eventos
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PayrollCalculator } from '@/lib/calculadora-v2';
import { Turno, ITurno } from '@/lib/turno';
import turnosData from '@/lib/turnos-data';
import {
  CalculoConEventosRequestSchema,
  validarCodigosTurnos,
  formatearErroresZod,
  type Evento,
} from '@/lib/validation';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = CalculoConEventosRequestSchema.parse(body);

    // Validar que todos los códigos de turno existan
    const codigosDisponibles = turnosData.map(t => t.codigo);
    const codigosInvalidos = validarCodigosTurnos(validatedData.turnos, codigosDisponibles);

    if (codigosInvalidos.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Códigos de turno no válidos',
          detalles: codigosInvalidos,
        },
        { status: 400 }
      );
    }

    // Crear calculadora v2 con la quincena especificada
    const calc = new PayrollCalculator(validatedData.quincena);

    // Agregar turnos
    let turnoCount = 0;
    for (const codigo of validatedData.turnos) {
      const turnoData = turnosData.find(t => t.codigo === codigo);
      if (turnoData) {
        try {
          const turno = new Turno(turnoData as ITurno);
          calc.agregarTurno(turno);
          turnoCount++;
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: `Error al procesar turno ${codigo}`,
              detalle: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 400 }
          );
        }
      }
    }

    // Procesar eventos
    for (const evento of validatedData.eventos) {
      try {
        procesarEvento(calc, evento);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Error al procesar evento ${evento.tipo}`,
            detalle: error instanceof Error ? error.message : 'Error desconocido',
          },
          { status: 400 }
        );
      }
    }

    // Obtener resultado
    const civicas = validatedData.civicas || 0;
    const resultado = calc.obtenerResultado(turnoCount, civicas);

    return NextResponse.json({
      success: true,
      data: resultado,
      _metadata: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        quincena: validatedData.quincena,
        eventos_procesados: validatedData.eventos.length,
      },
    });
  } catch (error) {
    // Manejo de errores de validación Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          ...formatearErroresZod(error),
        },
        { status: 400 }
      );
    }

    // Error general
    console.error('Error calculating payroll with events (v1):', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        detalle: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * Procesa un evento y lo agrega a la calculadora
 */
function procesarEvento(calc: PayrollCalculator, evento: Evento): void {
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
      // Compensatorio no requiere parámetros
      calc.agregarCP();
      break;

    case 'extra':
      if (!evento.minutos || evento.minutos < 1) {
        throw new Error('Extra requiere minutos >= 1');
      }
      const recargo = evento.recargo || 0;
      const nombre = evento.nombre || `Extra ${evento.minutos}min`;
      calc.agregarExtra(evento.minutos, recargo, nombre);
      break;

    case 'deduccion':
      if (!evento.nombre || !evento.valor || evento.valor <= 0) {
        throw new Error('Deducción requiere nombre y valor > 0');
      }
      calc.agregarDeduccion(evento.nombre, evento.valor);
      break;

    case 'dispo':
      // Disponible se procesa como un turno sintético
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
 * Procesa un evento DISPO (disponible)
 *
 * El disponible es un turno especial que:
 * - Se paga como un turno normal
 * - Aplica recargo según franja horaria si es festivo
 */
function procesarDispo(
  calc: PayrollCalculator,
  inicio: string,
  fin: string,
  festivo: boolean
): void {
  // Crear un turno sintético para DISPO
  const dispoTurno: ITurno = {
    codigo: 'DISPO',
    hora_inicio: inicio,
    hora_fin: fin,
    festivo: festivo,
  };

  try {
    const turno = new Turno(dispoTurno);
    calc.agregarTurno(turno);
  } catch (error) {
    throw new Error(`Error procesando DISPO: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
