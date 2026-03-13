import { NextRequest, NextResponse } from 'next/server';
import { CalculadoraNomina, EventoData } from '@/lib/calculadora';
import { Turno, ITurno } from '@/lib/turno';
import turnosData from '@/lib/turnos-data';

interface CalculoConEventosRequest {
  quincena: string;
  turnos: string[];
  eventos: EventoData[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: CalculoConEventosRequest = await request.json();

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

    // Procesar eventos
    if (data.eventos && Array.isArray(data.eventos)) {
      for (const evento of data.eventos) {
        switch (evento.tipo) {
          case 'suspension':
            for (let i = 0; i < (evento.cantidad || 1); i++) {
              calc.agregarSuspension();
            }
            break;
          case 'licencia':
            for (let i = 0; i < (evento.cantidad || 1); i++) {
              calc.agregarLicencia();
            }
            break;
          case 'incapacidad':
            for (let i = 0; i < (evento.cantidad || 1); i++) {
              calc.agregarIncapacidad();
            }
            break;
          case 'cp':
            calc.agregarCp();
            break;
          case 'extra':
            if (evento.minutos !== undefined && evento.recargo !== undefined && evento.nombre) {
              calc.agregarExtra(evento.minutos, evento.recargo, evento.nombre);
            }
            break;
          case 'deduccion':
            if (evento.nombre && evento.valor !== undefined) {
              calc.agregarDeduccionManual(evento.nombre, evento.valor);
            }
            break;
          case 'dispo':
            if (evento.inicio && evento.fin && evento.festivo !== undefined) {
              calc.agregarDispo(evento.inicio, evento.fin, evento.festivo);
            }
            break;
        }
      }
    }

    // Retornar resultado
    const resultado = calc.getResultado(data.turnos.length);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error calculating payroll with events:', error);
    return NextResponse.json(
      { error: 'Failed to calculate payroll', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
