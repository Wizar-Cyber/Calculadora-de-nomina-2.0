/**
 * API v1: Obtener lista de turnos
 * GET /api/v1/turnos
 */

import { NextRequest, NextResponse } from 'next/server';
import turnosData from '@/lib/turnos-data';

export async function GET(): Promise<NextResponse> {
  try {
    // Retornar todos los turnos disponibles
    return NextResponse.json({
      success: true,
      count: turnosData.length,
      turnos: turnosData,
    });
  } catch (error) {
    console.error('Error fetching turnos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch turnos' },
      { status: 500 }
    );
  }
}
