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
import { buildCalculatorFromTurnos } from '@/lib/api-payroll';
import { CalculoRequestSchema, formatearErroresZod } from '@/lib/validation';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = CalculoRequestSchema.parse(body);

    const setup = buildCalculatorFromTurnos(validatedData.quincena, validatedData.turnos);
    if (!setup.ok) return setup.response;

    // Obtener resultado (cantidad de cívicas validada por esquema)
    const civicas = validatedData.civicas;
    const resultado = setup.calc.obtenerResultado(setup.turnoCount, civicas);

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
