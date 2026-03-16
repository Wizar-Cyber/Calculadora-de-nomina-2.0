/**
 * Motor de cálculo de nómina refactorizado (v2)
 * 
 * Separado en responsabilidades:
 * - RecargosCalculator: Calcula recargos por franja horaria
 * - DeduccionesCalculator: Calcula deducciones (salud, pensión)
 * - EventosProcessor: Procesa eventos especiales (licencia, incapacidad, etc)
 * - PayrollCalculator: Orquestador que une todo
 */

import {
  SALARIO_QUINCENA,
  VALOR_HORA,
  VALOR_MINUTO,
  AUXILIO_TRANSPORTE,
  PASAJES_CIVICA_VALOR,
  DEDUCCIONES_BASE,
  RECARGO_ORDINARIO_NOCTURNO,
  RECARGO_DOMINICAL_DIURNO,
  RECARGO_DOMINICAL_NOCTURNO,
} from './config';
import { Turno } from './turno';
import {
  pesosToCentavos,
  centavosToPesos,
  multiplicarCentavos,
  sumarCentavos,
  aplicarPorcentaje,
  reducirPorcentaje,
  calcularValorHoras,
} from './money';

/**
 * Resultado de un cálculo de nómina
 */
export interface PayrollResultV2 {
  devengado: number;
  auxilio: number;
  civicas: number;
  deducciones: number;
  neto: number;
  desglose_devengados: Record<string, number | string>;
  desglose_deducciones: Record<string, number>;
  dias_trabajados: number;
  turnos_count: number;
}

/**
 * Calcula recargos por turno según franja horaria y tipo de día
 */
export class RecargosCalculator {
  private readonly VALOR_HORA_CENTAVOS: number;
  private readonly VALOR_MINUTO_CENTAVOS: number;

  constructor() {
    this.VALOR_HORA_CENTAVOS = pesosToCentavos(VALOR_HORA);
    this.VALOR_MINUTO_CENTAVOS = pesosToCentavos(VALOR_MINUTO);
  }

  /**
   * Divide las horas reales del turno por franja: diurna (6-19) y nocturna (19-6)
   */
  private calcularHorasPorFranja(turno: Turno): [number, number] {
    let inicio = turno.horaInicioObj();
    let fin = turno.horaFinObj();

    if (fin <= inicio) {
      fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
    }

    let horasDiurnas = 0.0;
    let horasNocturnas = 0.0;
    const puntosTransicion: Date[] = [];

    const diaInicio = new Date(inicio);
    diaInicio.setHours(0, 0, 0, 0);
    const hora06Inicio = new Date(diaInicio);
    hora06Inicio.setHours(6, 0, 0, 0);
    const hora19Inicio = new Date(diaInicio);
    hora19Inicio.setHours(19, 0, 0, 0);

    if (hora06Inicio > inicio && hora06Inicio < fin) {
      puntosTransicion.push(hora06Inicio);
    }
    if (hora19Inicio > inicio && hora19Inicio < fin) {
      puntosTransicion.push(hora19Inicio);
    }

    const diaSiguiente = new Date(diaInicio);
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);
    const hora06Siguiente = new Date(diaSiguiente);
    hora06Siguiente.setHours(6, 0, 0, 0);
    const hora19Siguiente = new Date(diaSiguiente);
    hora19Siguiente.setHours(19, 0, 0, 0);

    if (hora06Siguiente > inicio && hora06Siguiente < fin) {
      puntosTransicion.push(hora06Siguiente);
    }
    if (hora19Siguiente > inicio && hora19Siguiente < fin) {
      puntosTransicion.push(hora19Siguiente);
    }

    puntosTransicion.sort((a, b) => a.getTime() - b.getTime());

    const segmentos = [inicio, ...puntosTransicion, fin];

    for (let i = 0; i < segmentos.length - 1; i++) {
      const tiempoInicio = segmentos[i];
      const tiempoFin = segmentos[i + 1];

      if (tiempoInicio >= tiempoFin) {
        continue;
      }

      const minutosSegmento = (tiempoFin.getTime() - tiempoInicio.getTime()) / (1000 * 60);
      const horasSegmento = minutosSegmento / 60;

      const hour = tiempoInicio.getHours();
      if (hour >= 19 || hour < 6) {
        horasNocturnas += horasSegmento;
      } else {
        horasDiurnas += horasSegmento;
      }
    }

    return [horasDiurnas, horasNocturnas];
  }

  /**
   * Calcula recargos de un turno en centavos.
   * Retorna valor total y desglose con horas por tipo de recargo.
   */
  calcularRecargo(turno: Turno): { valor: number; desglose: Record<string, { valorCentavos: number; horas: number }> } {
    const [horasDiurnas, horasNocturnas] = this.calcularHorasPorFranja(turno);
    const festivo = turno.festivo;

    let valorTotalCentavos = 0;
    const desglose: Record<string, { valorCentavos: number; horas: number }> = {};

    if (festivo) {
      // Recargo dominical diurno (6-19): +80%
      if (horasDiurnas > 0) {
        const valorDiurnoCentavos = calculateValorHorasCentavos(horasDiurnas, this.VALOR_HORA_CENTAVOS);
        const recargoCentavos = Math.round(valorDiurnoCentavos * RECARGO_DOMINICAL_DIURNO);
        valorTotalCentavos += recargoCentavos;
        desglose['R FESTIVO DIURN'] = { valorCentavos: recargoCentavos, horas: horasDiurnas };
      }

      // Recargo dominical nocturno (19-06): +210%
      if (horasNocturnas > 0) {
        const valorNocturnoCentavos = calculateValorHorasCentavos(horasNocturnas, this.VALOR_HORA_CENTAVOS);
        const recargoCentavos = Math.round(valorNocturnoCentavos * RECARGO_DOMINICAL_NOCTURNO);
        valorTotalCentavos += recargoCentavos;
        desglose['R FESTIVO NOCT'] = { valorCentavos: recargoCentavos, horas: horasNocturnas };
      }
    } else {
      // Ordinario: solo recargo nocturno (+35%)
      if (horasNocturnas > 0) {
        const valorNocturnoCentavos = calculateValorHorasCentavos(horasNocturnas, this.VALOR_HORA_CENTAVOS);
        const recargoCentavos = Math.round(valorNocturnoCentavos * RECARGO_ORDINARIO_NOCTURNO);
        valorTotalCentavos += recargoCentavos;
        desglose['R ORDINARIO NOC'] = { valorCentavos: recargoCentavos, horas: horasNocturnas };
      }
    }

    return {
      valor: valorTotalCentavos,
      desglose,
    };
  }
}

/**
 * Calcula deducciones (salud, pensión)
 */
export class DeduccionesCalculator {
  /**
   * Calcula deducciones en centavos
   */
  calcularDeducciones(devengadoCentavos: number): {
    valor: number;
    desglose: Record<string, number>;
  } {
    const desglose: Record<string, number> = {};
    let totalCentavos = 0;

    for (const [concepto, porcentaje] of Object.entries(DEDUCCIONES_BASE)) {
      const deduccionCentavos = Math.round(devengadoCentavos * porcentaje);
      totalCentavos += deduccionCentavos;
      desglose[concepto] = centavosToPesos(deduccionCentavos);
    }

    return {
      valor: totalCentavos,
      desglose,
    };
  }
}

/**
 * Procesa eventos especiales (suspensión, licencia, incapacidad, CP, etc)
 */
export class EventosProcessor {
  private readonly VALOR_DIA_BASICO_CENTAVOS: number;

  constructor() {
    const valorDiaBasico = SALARIO_QUINCENA / 15;
    this.VALOR_DIA_BASICO_CENTAVOS = pesosToCentavos(valorDiaBasico);
  }

  /**
   * Procesa incapacidad: paga 66.67% del día
   */
  procesarIncapacidad(dias: number): { valor: number; diasRestados: number } {
    const valorPagoCentavos = Math.round(this.VALOR_DIA_BASICO_CENTAVOS * 0.6667);
    return {
      valor: multiplicarCentavos(valorPagoCentavos, dias),
      diasRestados: dias,
    };
  }

  /**
   * Procesa suspensión: descuenta el día completo
   */
  procesarSuspension(dias: number): { valor: number; diasRestados: number } {
    return {
      valor: -multiplicarCentavos(this.VALOR_DIA_BASICO_CENTAVOS, dias),
      diasRestados: dias,
    };
  }

  /**
   * Procesa licencia no remunerada: descuenta el día
   */
  procesarLicencia(dias: number): { valor: number; diasRestados: number } {
    return {
      valor: -multiplicarCentavos(this.VALOR_DIA_BASICO_CENTAVOS, dias),
      diasRestados: dias,
    };
  }

  /**
   * Procesa compensatorio: sin impacto en cálculo de nómina.
   *
   * Nota: El botón de CP se usa para lógica externa de cívicas/UI.
   */
  procesarCP(): number {
    return 0;
  }

  /**
   * Procesa hora extra con recargo
   */
  procesarExtra(minutos: number, porcentajeRecargo: number): number {
    const baseCentavos = multiplicarCentavos(pesosToCentavos(VALOR_MINUTO), minutos);
    const factor = normalizarFactorExtra(porcentajeRecargo);
    return Math.round(baseCentavos * factor);
  }
}

/**
 * Orquestador del cálculo de nómina.
 * Replica la lógica exacta de calculadora.py (Python original).
 */
export class PayrollCalculator {
  private recargosCalculator: RecargosCalculator;
  private deduccionesCalculator: DeduccionesCalculator;

  private devengadoCentavos: number;
  private diasTrabajados: number = 15;
  private quincena: string;

  // Tracking para desglose correcto
  private recargosAgrupados: Record<string, { valorCentavos: number; horas: number }> = {};
  private extras: Array<{ nombre: string; horas: number; valorCentavos: number }> = [];
  private deduccionesManuales: Array<{ nombre: string; valorCentavos: number }> = [];
  private diasIncapacidad: number = 0;
  private diasSuspension: number = 0;
  private diasLicencia: number = 0;

  private readonly VALOR_DIA_BASICO_CENTAVOS: number;
  constructor(quincena: string = '30') {
    this.recargosCalculator = new RecargosCalculator();
    this.deduccionesCalculator = new DeduccionesCalculator();
    this.quincena = quincena;
    this.VALOR_DIA_BASICO_CENTAVOS = pesosToCentavos(SALARIO_QUINCENA / 15);
    this.devengadoCentavos = pesosToCentavos(SALARIO_QUINCENA);
  }

  /**
   * Agrega un turno y acumula recargos con horas
   */
  agregarTurno(turno: Turno): void {
    const { valor, desglose } = this.recargosCalculator.calcularRecargo(turno);
    this.devengadoCentavos += valor;

    for (const [concepto, data] of Object.entries(desglose)) {
      if (!this.recargosAgrupados[concepto]) {
        this.recargosAgrupados[concepto] = { valorCentavos: 0, horas: 0 };
      }
      this.recargosAgrupados[concepto].valorCentavos += data.valorCentavos;
      this.recargosAgrupados[concepto].horas += data.horas;
    }
  }

  /**
   * Incapacidad: resta día completo y paga 66.67% (neto: -33.33% por día)
   */
  agregarIncapacidad(dias: number): void {
    for (let i = 0; i < dias; i++) {
      this.diasIncapacidad += 1;
      this.diasTrabajados -= 1;
      // Restar día completo del básico
      this.devengadoCentavos -= this.VALOR_DIA_BASICO_CENTAVOS;
      // Sumar 66.67% como pago por incapacidad
      this.devengadoCentavos += Math.round(this.VALOR_DIA_BASICO_CENTAVOS * 0.6667);
    }
  }

  /**
   * Suspensión: descuenta días trabajados (se muestra como deducción en la colilla)
   */
  agregarSuspension(dias: number): void {
    for (let i = 0; i < dias; i++) {
      this.diasSuspension += 1;
      this.diasTrabajados -= 1;
    }
  }

  /**
   * Licencia no remunerada: descuenta días trabajados (se muestra como deducción en la colilla)
   */
  agregarLicencia(dias: number): void {
    for (let i = 0; i < dias; i++) {
      this.diasLicencia += 1;
      this.diasTrabajados -= 1;
    }
  }

  /**
   * Compensatorio: sin impacto en devengado ni días.
   */
  agregarCP(): void {
    // Intencionalmente no-op.
    // El evento CP no debe afectar colilla, devengado ni días trabajados.
  }

  /**
   * Hora extra: base por minuto × factor de recargo
   */
  agregarExtra(minutos: number, recargo: number, nombre: string): void {
    const baseCentavos = multiplicarCentavos(pesosToCentavos(VALOR_MINUTO), minutos);
    const factor = normalizarFactorExtra(recargo);
    const valorCentavos = Math.round(baseCentavos * factor);
    this.devengadoCentavos += valorCentavos;
    this.extras.push({ nombre, horas: minutos / 60, valorCentavos });
  }

  /**
   * Deducción manual: NO reduce devengado, se suma a deducciones
   */
  agregarDeduccion(nombre: string, valorPesos: number): void {
    this.deduccionesManuales.push({ nombre, valorCentavos: pesosToCentavos(valorPesos) });
  }

  /**
   * Retorna el resultado completo del cálculo
   */
  obtenerResultado(
    turnos_count: number,
    civicasCantidad: number = 0,
    civicasValor: number = PASAJES_CIVICA_VALOR
  ): PayrollResultV2 {
    const valorDiaBasico = SALARIO_QUINCENA / 15;

    // === Calcular valores de suspensión y licencia como deducciones ===
    const suspensionCentavos = this.diasSuspension * this.VALOR_DIA_BASICO_CENTAVOS;
    const licenciaCentavos = this.diasLicencia * this.VALOR_DIA_BASICO_CENTAVOS;

    // devengadoCentavos NO tiene restado suspensión/licencia (se muestran como deducciones)
    const devengadoPesos = centavosToPesos(this.devengadoCentavos);

    // Base para salud/pensión: devengado sin suspensión ni licencia (IBC correcto)
    const devengadoParaDeduccionesCentavos = this.devengadoCentavos - suspensionCentavos - licenciaCentavos;

    // === Cívicas: usar cantidad ingresada por usuario (modal/API) ===
    // Se desactiva el cálculo automático para evitar hardcode a 24.
    let civicasFinal = Math.max(0, Math.floor(civicasCantidad || 0));
    const civicasPesos = civicasFinal * civicasValor;

    // === Auxilio: solo quincena 30, descuenta días no laborados + incapacidad ===
    let auxilioPesos = 0;
    if (this.quincena === '30') {
      const valorDiarioAuxilio = AUXILIO_TRANSPORTE / 30;
      const diasDescuento = 15 - this.diasTrabajados + this.diasIncapacidad;
      auxilioPesos = Math.round((AUXILIO_TRANSPORTE - (diasDescuento * valorDiarioAuxilio)) * 100) / 100;
      auxilioPesos = Math.max(0, auxilioPesos);
    }

    // === Desglose Devengados ===
    const desgloseDevengados: Record<string, number | string> = {};

    // Salario Básico: usar días realmente trabajados (descuenta incapacidad/suspensión/licencia)
    const diasBasico = this.diasTrabajados;
    desgloseDevengados[`Salario Básico (${diasBasico} días)`] = Math.round(diasBasico * valorDiaBasico * 100) / 100;

    // Cívicas con cantidad de pasajes (solo mostrar si hay cantidad > 0)
    if (civicasFinal > 0) {
      desgloseDevengados[`Cívicas (${civicasFinal} pasajes)`] = civicasPesos;
    }

    // Auxilio de Transporte (solo mostrar si aplica y es > 0)
    if (auxilioPesos > 0) {
      desgloseDevengados['Auxilio de Transporte'] = auxilioPesos;
    }

    // Recargos con formato horas | valor
    const recargosMap: Record<string, string> = {
      'R ORDINARIO NOC': 'R Ordinario Nocturno',
      'R FESTIVO DIURN': 'R Festivo Diurno',
      'R FESTIVO NOCT': 'R Festivo Nocturno',
    };
    for (const [key, data] of Object.entries(this.recargosAgrupados)) {
      const etiqueta = recargosMap[key] || key;
      const valorPesos = centavosToPesos(data.valorCentavos);
      desgloseDevengados[etiqueta] = `${data.horas.toFixed(1)}h | $${valorPesos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    }

    // Incapacidad con días y porcentaje
    if (this.diasIncapacidad > 0) {
      const diasText = `${this.diasIncapacidad} día${this.diasIncapacidad > 1 ? 's' : ''}`;
      const valorIncapacidad = Math.round(this.diasIncapacidad * valorDiaBasico * 0.6667 * 100) / 100;
      desgloseDevengados[`Incapacidad (${diasText} al 66.67%)`] = valorIncapacidad;
    }

    // Horas extras con formato unificado: "X.XXh | $valor"
    const extrasAgrupadas: Record<string, { horas: number; valorCentavos: number }> = {};
    for (const extra of this.extras) {
      if (!extrasAgrupadas[extra.nombre]) {
        extrasAgrupadas[extra.nombre] = { horas: 0, valorCentavos: 0 };
      }
      extrasAgrupadas[extra.nombre].horas += extra.horas;
      extrasAgrupadas[extra.nombre].valorCentavos += extra.valorCentavos;
    }

    for (const [nombre, data] of Object.entries(extrasAgrupadas)) {
      const valorPesos = centavosToPesos(data.valorCentavos);
      desgloseDevengados[nombre] = `${data.horas.toFixed(2)}h | $${valorPesos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    }

    // === Desglose Deducciones ===
    // Salud y pensión se calculan sobre el devengado efectivo (sin suspensión/licencia)
    const { valor: deduccionesCentavos, desglose: desgloseDeducciones } =
      this.deduccionesCalculator.calcularDeducciones(devengadoParaDeduccionesCentavos);

    let deduccionesTotalCentavos = deduccionesCentavos;

    // Suspensión/Licencia unificadas en una sola deducción visible en la colilla
    const diasSuspLic = this.diasSuspension + this.diasLicencia;
    const suspLicCentavos = suspensionCentavos + licenciaCentavos;
    if (diasSuspLic > 0) {
      const diasText = `${diasSuspLic} día${diasSuspLic > 1 ? 's' : ''}`;
      desgloseDeducciones[`Susp/Lic (${diasText})`] = centavosToPesos(suspLicCentavos);
      deduccionesTotalCentavos += suspLicCentavos;
    }

    // Deducciones manuales
    for (const ded of this.deduccionesManuales) {
      desgloseDeducciones[ded.nombre] = (desgloseDeducciones[ded.nombre] || 0) + centavosToPesos(ded.valorCentavos);
      deduccionesTotalCentavos += ded.valorCentavos;
    }

    const deduccionesPesos = centavosToPesos(deduccionesTotalCentavos);
    const netoPesos = Math.round((devengadoPesos + civicasPesos + auxilioPesos - deduccionesPesos) * 100) / 100;

    return {
      devengado: devengadoPesos,
      auxilio: auxilioPesos,
      civicas: civicasPesos,
      deducciones: deduccionesPesos,
      neto: netoPesos,
      desglose_devengados: desgloseDevengados,
      desglose_deducciones: desgloseDeducciones,
      dias_trabajados: this.diasTrabajados,
      turnos_count,
    };
  }
}

/**
 * Helper para calcular valor de horas en centavos
 */
function calculateValorHorasCentavos(horas: number, valorHoraCentavos: number): number {
  return calcularValorHoras(horas, valorHoraCentavos);
}

/**
 * Normaliza el recargo de extra a factor multiplicador sobre la base.
 *
 * Soporta:
 * - Factor directo (nuevo): 1.25, 1.75, 2.05, 2.55
 * - Decimal recargo (legacy): 0.25, 0.75, 1.05, 1.55
 * - Porcentaje entero: 25, 75, 105, 155
 */
function normalizarFactorExtra(recargo: number): number {
  const r = Number(recargo);
  if (!Number.isFinite(r)) return 1;

  // Ej: 0.25 -> 1.25
  if (r >= 0 && r < 1) return 1 + r;

  // Ej: 1.25, 1.75, 2.05
  if (r >= 1 && r <= 3) return r;

  // Ej: 25 -> 1.25
  if (r > 3) return 1 + r / 100;

  return 1;
}
