/**
 * API v1: Calcular nómina básica
 * POST /api/v1/calcular
 *
 * Ejemplo de request:
 * {
 *   "quincena": "15" o "30",
 *   "turnos": ["250M", "251M", "252M", ...],
 *   "civicas": 5
 * }
 *
 * Cambios en v1:
 * - Validación robusta con Zod
 * - Precisión monetaria mejorada
 * - Parámetro civicas para entrada manual
 * - Mejor manejo de errores
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PayrollCalculator } from '@/lib/calculadora-v2';
import { Turno, ITurno } from '@/lib/turno';
import turnosData from '@/lib/turnos-data';
import { CalculoRequestSchema, validarCodigosTurnos, formatearErroresZod } from '@/lib/validation';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = CalculoRequestSchema.parse(body);

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

    // Obtener resultado (cantidad de cívicas validada por esquema)
    const civicas = validatedData.civicas;
    const resultado = calc.obtenerResultado(turnoCount, civicas);

    return NextResponse.json({
      success: true,
      data: resultado,
      _metadata: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        quincena: validatedData.quincena,
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
    console.error('Error calculating payroll (v1):', error);
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
