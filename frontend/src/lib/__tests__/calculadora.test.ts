/**
 * Tests unitarios para la calculadora de nómina v2
 * 
 * Ejecutar: npm run test
 * 
 * Cobertura de:
 * - Utilitarios de precisión monetaria
 * - Calculadora de recargos
 * - Calculadora de deducciones
 * - Procesador de eventos
 * - Calculadora general de nómina
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  pesosToCentavos,
  centavosToPesos,
  multiplicarCentavos,
  sumarCentavos,
  aplicarPorcentaje,
  reducirPorcentaje,
  calcularValorHoras,
} from '@/lib/money';
import { RecargosCalculator, DeduccionesCalculator, EventosProcessor, PayrollCalculator } from '@/lib/calculadora-v2';
import { Turno } from '@/lib/turno';

describe('Utilidades de Precisión Monetaria', () => {
  describe('pesosToCentavos', () => {
    it('convierte pesos a centavos correctamente', () => {
      expect(pesosToCentavos(100)).toBe(10000);
      expect(pesosToCentavos(13041.81)).toBe(1304181);
      expect(pesosToCentavos(0.01)).toBe(1);
    });

    it('maneja valores decimales correctamente', () => {
      expect(pesosToCentavos(1.5)).toBe(150);
      expect(pesosToCentavos(99.99)).toBe(9999);
    });
  });

  describe('centavosToPesos', () => {
    it('convierte centavos a pesos correctamente', () => {
      expect(centavosToPesos(10000)).toBe(100);
      expect(centavosToPesos(1304181)).toBe(13041.81);
    });
  });

  describe('aplicarPorcentaje', () => {
    it('aplica recargo del 35% correctamente', () => {
      const base = pesosToCentavos(1000); // 1000 pesos
      const conRecargo = aplicarPorcentaje(base, 35);
      expect(centavosToPesos(conRecargo)).toBe(1350); // 1350 pesos
    });

    it('aplica recargo del 80% (festivo diurno)', () => {
      const base = pesosToCentavos(1000);
      const conRecargo = aplicarPorcentaje(base, 80);
      expect(centavosToPesos(conRecargo)).toBe(1800);
    });

    it('aplica recargo del 210% (festivo nocturno)', () => {
      const base = pesosToCentavos(1000);
      const conRecargo = aplicarPorcentaje(base, 210);
      expect(centavosToPesos(conRecargo)).toBe(3100);
    });
  });

  describe('reducirPorcentaje', () => {
    it('reduce 4% correctamente (salud)', () => {
      const base = pesosToCentavos(1000);
      const conDescuento = reducirPorcentaje(base, 4);
      expect(centavosToPesos(conDescuento)).toBe(960);
    });
  });

  describe('calcularValorHoras', () => {
    const VALOR_HORA_CENTAVOS = pesosToCentavos(13041.81);

    it('calcula 6 horas correctamente', () => {
      const resultado = calcularValorHoras(6, VALOR_HORA_CENTAVOS);
      const pesos = centavosToPesos(resultado);
      expect(pesos).toBeCloseTo(78250.86, 2);
    });

    it('calcula 5.33 horas correctamente', () => {
      const resultado = calcularValorHoras(5.33, VALOR_HORA_CENTAVOS);
      const pesos = centavosToPesos(resultado);
      expect(pesos).toBeCloseTo(69533.25, 2);
    });
  });
});

describe('Calculadora de Recargos', () => {
  let recargosCalc: RecargosCalculator;

  beforeEach(() => {
    recargosCalc = new RecargosCalculator();
  });

  it('calcula recargo de turno ordinario nocturno', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '19:00',
      hora_fin: '01:00',
      festivo: false,
    });

    const { valor } = recargosCalc.calcularRecargo(turno);
    expect(valor).toBeGreaterThan(0);
  });

  it('calcula recargo de turno festivo', () => {
    const turno = new Turno({
      codigo: '150CC',
      hora_inicio: '03:58',
      hora_fin: '09:30',
      festivo: true,
    });

    const { valor } = recargosCalc.calcularRecargo(turno);
    expect(valor).toBeGreaterThan(0);
  });
});

describe('Calculadora de Deducciones', () => {
  let deduccionesCalc: DeduccionesCalculator;

  beforeEach(() => {
    deduccionesCalc = new DeduccionesCalculator();
  });

  it('calcula deducciones de 4% salud + 4% pensión', () => {
    const devengadoCentavos = pesosToCentavos(2347526); // Salario básico mensual
    const { valor } = deduccionesCalc.calcularDeducciones(devengadoCentavos);

    const pesos = centavosToPesos(valor);
    const porcentajeFinal = (pesos / 2347526) * 100;

    // Debería ser 8% (4% + 4%)
    expect(porcentajeFinal).toBeCloseTo(8, 0);
  });
});

describe('Procesador de Eventos', () => {
  let eventosProc: EventosProcessor;

  beforeEach(() => {
    eventosProc = new EventosProcessor();
  });

  it('calcula incapacidad (66.67% del día)', () => {
    const { valor } = eventosProc.procesarIncapacidad(1);
    const pesos = centavosToPesos(valor);

    const valorDiaBasico = 1173763 / 15; // Salario quincena / 15 días
    const esperado = valorDiaBasico * 0.6667;

    expect(pesos).toBeCloseTo(esperado, 0);
  });

  it('calcula suspensión (descuento total)', () => {
    const { valor } = eventosProc.procesarSuspension(1);
    expect(valor).toBeLessThan(0);
  });

  it('calcula CP (jornada completa)', () => {
    const valor = eventosProc.procesarCP();
    const pesos = centavosToPesos(valor);

    const esperado = 13041.81 * 6; // VALOR_HORA * HORAS_JORNADA
    expect(pesos).toBeCloseTo(esperado, 0);
  });
});

describe('Calculadora General de Nómina', () => {
  let calc: PayrollCalculator;

  beforeEach(() => {
    calc = new PayrollCalculator();
  });

  it('calcula nómina básica sin eventos', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '06:00',
      hora_fin: '12:00',
      festivo: false,
    });

    calc.agregarTurno(turno);
    const resultado = calc.obtenerResultado(1, 0); // 1 turno, 0 cívicas

    expect(resultado.devengado).toBeGreaterThan(0);
    expect(resultado.neto).toBeGreaterThan(0);
    expect(resultado.deducciones).toBeGreaterThan(0);
    expect(resultado.turnos_count).toBe(1);
  });

  it('calcula nómina con cívicas manuales', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '06:00',
      hora_fin: '12:00',
      festivo: false,
    });

    calc.agregarTurno(turno);
    const resultado = calc.obtenerResultado(1, 5); // 5 cívicas

    expect(resultado.civicas).toBe(5 * 4500); // 5 * PASAJES_CIVICA_VALOR
    expect(resultado.neto).toBeGreaterThan(0);
  });

  it('calcula nómina con eventos', () => {
    // Agregar 2 días de incapacidad
    calc.agregarIncapacidad(2);

    // Agregar CP
    calc.agregarCP();

    const resultado = calc.obtenerResultado(0, 0);

    expect(resultado.devengado).toBeGreaterThan(0);
    expect(resultado.dias_trabajados).toBeLessThan(15);
  });

  it('neto = devengado + civicas - deducciones', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '06:00',
      hora_fin: '12:00',
      festivo: false,
    });

    calc.agregarTurno(turno);
    const resultado = calc.obtenerResultado(1, 3);

    const netEsperado = resultado.devengado + resultado.civicas - resultado.deducciones;
    expect(resultado.neto).toBeCloseTo(netEsperado, 2);
  });

  it('desglose_devengados contiene conceptos correctos', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '06:00',
      hora_fin: '12:00',
      festivo: false,
    });

    calc.agregarTurno(turno);
    const resultado = calc.obtenerResultado(1, 0);

    expect(resultado.desglose_devengados).toHaveProperty('Salario Básico');
    expect(resultado.desglose_devengados['Salario Básico']).toBeGreaterThan(0);
  });

  it('desglose_deducciones contiene categorías esperadas', () => {
    const turno = new Turno({
      codigo: '250M',
      hora_inicio: '06:00',
      hora_fin: '12:00',
      festivo: false,
    });

    calc.agregarTurno(turno);
    const resultado = calc.obtenerResultado(1, 0);

    // Debería tener deducciones de salud y pensión
    expect(Object.keys(resultado.desglose_deducciones).length).toBeGreaterThan(0);
  });
});

describe('Validación de Turnos', () => {
  it('lanza error si código está vacío', () => {
    expect(() => {
      new Turno({
        codigo: '',
        hora_inicio: '06:00',
        hora_fin: '12:00',
        festivo: false,
      });
    }).toThrow('Código de turno no puede estar vacío');
  });

  it('lanza error si hora tiene formato incorrecto', () => {
    expect(() => {
      new Turno({
        codigo: '250M',
        hora_inicio: '25:00', // Hora inválida
        hora_fin: '12:00',
        festivo: false,
      });
    }).toThrow();
  });

  it('lanza error si minutos son inválidos', () => {
    expect(() => {
      new Turno({
        codigo: '250M',
        hora_inicio: '06:60', // Minutos inválidos
        hora_fin: '12:00',
        festivo: false,
      });
    }).toThrow();
  });

  it('acepta horas válidas', () => {
    expect(() => {
      new Turno({
        codigo: '250M',
        hora_inicio: '00:00',
        hora_fin: '23:59',
        festivo: false,
      });
    }).not.toThrow();
  });
});
