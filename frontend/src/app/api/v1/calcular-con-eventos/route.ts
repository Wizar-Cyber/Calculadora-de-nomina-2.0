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
import { buildCalculatorFromTurnos, procesarEvento } from '@/lib/api-payroll';
import {
  CalculoConEventosRequestSchema,
  formatearErroresZod,
} from '@/lib/validation';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = CalculoConEventosRequestSchema.parse(body);

    const setup = buildCalculatorFromTurnos(validatedData.quincena, validatedData.turnos);
    if (!setup.ok) return setup.response;

    // Procesar eventos
    for (const evento of validatedData.eventos) {
      try {
        procesarEvento(setup.calc, evento);
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
    const resultado = setup.calc.obtenerResultado(setup.turnoCount, civicas);

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
