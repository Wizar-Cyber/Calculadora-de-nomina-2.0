import { NextRequest, NextResponse } from 'next/server';
import turnosData from '@/lib/turnos-data';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({
      turnos: turnosData,
    });
  } catch (error) {
    console.error('Error fetching turnos:', error);
    return NextResponse.json(
      { error: 'Failed to load turnos', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
