import { NextRequest, NextResponse } from 'next/server';
import { CalculadoraNomina } from '@/lib/calculadora';
import { Turno, ITurno } from '@/lib/turno';
import turnosData from '@/lib/turnos-data';

interface CalculoRequest {
  quincena: string;
  turnos: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: CalculoRequest = await request.json();

    // Validar datos
    if (!data.quincena || !Array.isArray(data.turnos)) {
      return NextResponse.json(
        { error: 'Invalid request: quincena and turnos array are required' },
        { status: 400 }
      );
    }

    // Crear calculadora
    const calc = new CalculadoraNomina(data.quincena);

    // Agregar turnos
    for (const codigo of data.turnos) {
      const turnoData = turnosData.find((t) => t.codigo === codigo);
      if (turnoData) {
        const turno = new Turno(turnoData as ITurno);
        calc.agregarTurno(turno);
      }
    }

    // Retornar resultado
    const resultado = calc.getResultado(data.turnos.length);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error calculating payroll:', error);
    return NextResponse.json(
      { error: 'Failed to calculate payroll', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
