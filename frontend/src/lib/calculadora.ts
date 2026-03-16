import {
  SALARIO_QUINCENA,
  HORAS_JORNADA,
  VALOR_HORA,
  VALOR_MINUTO,
  AUXILIO_TRANSPORTE,
  PASAJES_CIVICA_CANTIDAD,
  PASAJES_CIVICA_VALOR,
  DEDUCCIONES_BASE,
  RECARGO_ORDINARIO_NOCTURNO,
  RECARGO_DOMINICAL_DIURNO,
  RECARGO_DOMINICAL_NOCTURNO,
} from './config';
import { Turno, ITurno } from './turno';

export interface EventoData {
  tipo: string; // "suspension", "licencia", "incapacidad", "cp", "dispo", "extra", "deduccion"
  cantidad?: number; // Para suspension, licencia, incapacidad
  minutos?: number; // Para extra
  recargo?: number; // Para extra
  nombre?: string; // Para extra y deduccion
  valor?: number; // Para deduccion
  inicio?: string; // Para dispo
  fin?: string; // Para dispo
  festivo?: boolean; // Para dispo
}

export interface PayrollResult {
  devengado: number;
  auxilio: number;
  civicas: number;
  deducciones: number;
  neto: number;
  desglose_devengados: Record<string, any>;
  desglose_deducciones: Record<string, any>;
  dias_trabajados: number;
  turnos_count: number;
  detalles_turnos: any[];
  tiene_cp: boolean;
  dias_incapacidad: number;
  dias_suspension?: number;
  dias_licencia?: number;
}

/**
 * Motor de cálculo de nómina por quincena.
 * 
 * Responsabilidades:
 * - Acumular devengado (salario base + recargos + extras + eventos)
 * - Calcular deducciones base (salud/pensión) y manuales
 * - Calcular cívicas y auxilio según reglas de negocio
 */
export class CalculadoraNomina {
  devengado: number;
  quincena: string;
  valor_dia_basico: number;
  detalles_turnos: any[] = [];
  detalles_desglose: any[] = [];
  deducciones_manuales: Array<[string, number]> = [];
  dias_incapacidad: number = 0;
  dias_suspension: number = 0;
  dias_licencia: number = 0;
  dias_trabajados: number = 15;
  recargos_agrupados: Record<string, any> = {};
  civicas_cantidad: number = 0;
  civicas_valor: number = 0;
  cp_agregado: boolean = false;

  constructor(quincena: string = '30') {
    this.quincena = quincena;
    this.devengado = SALARIO_QUINCENA;
    this.valor_dia_basico = SALARIO_QUINCENA / 15;
  }

  reinicializar(quincena?: string): void {
    if (!quincena) quincena = this.quincena;
    const newCalc = new CalculadoraNomina(quincena);
    Object.assign(this, newCalc);
  }

  /**
   * Retorna horas totales del turno (incluye cruce de medianoche)
   */
  horasTurnoCompleto(turno: Turno): number {
    let inicio = turno.horaInicioObj();
    let fin = turno.horaFinObj();
    if (fin <= inicio) {
      fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
    }
    const minutos = (fin.getTime() - inicio.getTime()) / (1000 * 60);
    return minutos / 60;
  }

  /**
   * Divide las horas reales del turno por franja horaria: diurna (6-19) y nocturna (19-6)
   */
  calcularHorasPorFranja(turno: Turno): [number, number] {
    let inicio = turno.horaInicioObj();
    let fin = turno.horaFinObj();

    if (fin <= inicio) {
      fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
    }

    let horasDiurnas = 0.0;
    let horasNocturnas = 0.0;
    const puntosTransicion: Date[] = [];

    // Crear puntos de transición para el día del inicio
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

    // Crear puntos de transición para el día siguiente (si el turno cruza medianoche)
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

    // Ordenar puntos de transición
    puntosTransicion.sort((a, b) => a.getTime() - b.getTime());

    // Construir segmentos: inicio -> primer punto -> segundo punto -> ... -> fin
    const segmentos = [inicio, ...puntosTransicion, fin];

    // Procesar cada segmento
    for (let i = 0; i < segmentos.length - 1; i++) {
      const tiempoInicio = segmentos[i];
      const tiempoFin = segmentos[i + 1];

      if (tiempoInicio >= tiempoFin) {
        continue;
      }

      const minutosSegmento = (tiempoFin.getTime() - tiempoInicio.getTime()) / (1000 * 60);
      const horasSegmento = minutosSegmento / 60;

      // Determinar si este segmento es diurno o nocturno
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
   * Verifica si el turno incluye horas entre 19:00 y 06:00
   */
  turnoTocaHorasNocturnas(turno: Turno): boolean {
    const inicio = turno.horaInicioObj();
    let fin = turno.horaFinObj();
    if (fin <= inicio) {
      fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
    }

    const inicioHour = inicio.getHours();
    const finHour = fin.getHours();

    // Si inicia en nocturno (19-06)
    if (inicioHour >= 19 || inicioHour < 6) {
      return true;
    }
    // Si termina en nocturno (después de las 19 o antes de las 6)
    if (finHour >= 19 || finHour < 6) {
      return true;
    }
    return false;
  }

  /**
   * Calcula recargos de un turno según franja (diurna/nocturna) y festivo.
   */
  calcularRecargo(turno: Turno): number {
    const [horasDiurnas, horasNocturnas] = this.calcularHorasPorFranja(turno);
    const festivo = turno.festivo;
    let valorTotal = 0;

    // Festivo / dominical
    if (festivo) {
      // Recargo dominical diurno (6-19): +80%
      if (horasDiurnas > 0) {
        const valorDiurno = horasDiurnas * VALOR_HORA * RECARGO_DOMINICAL_DIURNO;
        valorTotal += valorDiurno;
        this.detalles_turnos.push(['R FESTIVO DIURN', valorDiurno, horasDiurnas]);
        if (!this.recargos_agrupados['R FESTIVO DIURN']) {
          this.recargos_agrupados['R FESTIVO DIURN'] = { valor: 0, horas: 0 };
        }
        this.recargos_agrupados['R FESTIVO DIURN'].valor += valorDiurno;
        this.recargos_agrupados['R FESTIVO DIURN'].horas += horasDiurnas;
      }

      // Recargo dominical nocturno (19-06): +210%
      if (horasNocturnas > 0) {
        const valorNocturno = horasNocturnas * VALOR_HORA * RECARGO_DOMINICAL_NOCTURNO;
        valorTotal += valorNocturno;
        this.detalles_turnos.push(['R FESTIVO NOCT', valorNocturno, horasNocturnas]);
        if (!this.recargos_agrupados['R FESTIVO NOCT']) {
          this.recargos_agrupados['R FESTIVO NOCT'] = { valor: 0, horas: 0 };
        }
        this.recargos_agrupados['R FESTIVO NOCT'].valor += valorNocturno;
        this.recargos_agrupados['R FESTIVO NOCT'].horas += horasNocturnas;
      }
    } else {
      // Ordinario: solo hay recargo nocturno: +35%
      if (horasNocturnas > 0) {
        const valorNocturno = horasNocturnas * VALOR_HORA * RECARGO_ORDINARIO_NOCTURNO;
        valorTotal += valorNocturno;
        this.detalles_turnos.push(['R ORDINARIO NOC', valorNocturno, horasNocturnas]);
        if (!this.recargos_agrupados['R ORDINARIO NOC']) {
          this.recargos_agrupados['R ORDINARIO NOC'] = { valor: 0, horas: 0 };
        }
        this.recargos_agrupados['R ORDINARIO NOC'].valor += valorNocturno;
        this.recargos_agrupados['R ORDINARIO NOC'].horas += horasNocturnas;
      }
    }

    return valorTotal;
  }

  /**
   * Agrega un turno base y suma únicamente los recargos correspondientes.
   */
  agregarTurno(turno: Turno): void {
    const valor = this.calcularRecargo(turno);
    this.devengado += valor;
  }

  /**
   * Agrega disponible (DISPO): crea un turno especial y lo procesa como normal.
   */
  agregarDispo(inicio: string, fin: string, festivo: boolean): void {
    const turno = new Turno({
      codigo: 'DISPO',
      descripcion: 'Disponible',
      hora_inicio: inicio,
      hora_fin: fin,
      festivo: festivo,
    });
    this.agregarTurno(turno);
  }

  /**
   * Agrega un compensatorio (CP): sin impacto en el cálculo de nómina.
   */
  agregarCp(): void {
    // Intencionalmente no-op.
    // CP no debe afectar días, devengado ni colilla.
  }

  /**
   * Agrega un día de incapacidad: paga al 66.67% y ajusta días trabajados.
   */
  agregarIncapacidad(): void {
    this.dias_incapacidad += 1;
    this.dias_trabajados -= 1;

    // Restar el día completo del básico
    this.devengado -= this.valor_dia_basico;

    // SUMAR el 66.67% en devengados
    const valorPago = this.valor_dia_basico * 0.6667;
    this.devengado += valorPago;

    // Registrar en el desglose
    if (!this.recargos_agrupados['incapacidad']) {
      this.recargos_agrupados['incapacidad'] = { valor: 0, dias: 0 };
    }
    this.recargos_agrupados['incapacidad'].valor = this.dias_incapacidad * valorPago;
    this.recargos_agrupados['incapacidad'].dias = this.dias_incapacidad;
  }

  /**
   * Agrega suspensión: descuenta una jornada del básico y ajusta días trabajados.
   */
  agregarSuspension(): void {
    this.dias_suspension += 1;
    this.dias_trabajados -= 1;
    this.devengado -= this.valor_dia_basico;
  }

  /**
   * Agrega licencia no remunerada: descuenta una jornada del básico.
   */
  agregarLicencia(): void {
    this.dias_licencia += 1;
    this.dias_trabajados -= 1;
    this.devengado -= this.valor_dia_basico;
  }

  /**
   * Agrega una hora extra: base por minuto * factor de recargo.
   */
  agregarExtra(minutos: number, recargo: number, nombre: string): void {
    const base = minutos * VALOR_MINUTO;
    const valor = base * recargo;
    this.devengado += valor;
    const horas = minutos / 60;
    this.detalles_desglose.push([nombre, horas, valor]);
  }

  /**
   * Agrega una deducción ingresada por el usuario.
   */
  agregarDeduccionManual(nombre: string, valor: number): void {
    this.deducciones_manuales.push([nombre, valor]);
  }

  /**
   * Retorna el desglose completo de devengados incluyendo eventos.
   */
  getDesgloseDevengados(): Record<string, any> {
    // Calcular cantidad de cívicas para la etiqueta
    let civicasCantidad = PASAJES_CIVICA_CANTIDAD;
    if (this.tieneSuspension()) {
      civicasCantidad -= 2;
    }
    if (civicasCantidad < 0) {
      civicasCantidad = 0;
    }

    const desglose: Record<string, any> = {
      'Salario Básico (15 días)': this.dias_trabajados * this.valor_dia_basico,
      [`Cívicas (${civicasCantidad} pasajes)`]: this.totalCivicas(),
      'Auxilio de Transporte': this.totalAuxilio(),
    };

    // Agregar recargos con formato (excluyendo incapacidad)
    const recargosMap: Record<string, string> = {
      'R ORDINARIO NOCT': 'R Ordinario Nocturno',
      'R ORDINARIO NOC': 'R Ordinario Nocturno',
      'R FESTIVO DIURN': 'R Festivo Diurno',
      'R FESTIVO NOCT': 'R Festivo Nocturno',
    };

    for (const [k, v] of Object.entries(this.recargos_agrupados)) {
      if (k !== 'incapacidad') {
        const etiqueta = recargosMap[k] || k.toUpperCase();
        desglose[etiqueta] = `${v.horas.toFixed(1)}h | $${v.valor.toLocaleString('es-CO', {
          maximumFractionDigits: 0,
        })}`;
      }
    }

    // Agregar incapacidad a devengados (paga 66.67%)
    if (this.dias_incapacidad > 0) {
      const diasText = `${this.dias_incapacidad} día${this.dias_incapacidad > 1 ? 's' : ''}`;
      const valorIncapacidad = this.dias_incapacidad * this.valor_dia_basico * 0.6667;
      desglose[`Incapacidad (${diasText} al 66.67%)`] = valorIncapacidad;
    }

    // Agregar horas extras al desglose
    for (const [nombre, horas, valor] of this.detalles_desglose) {
      const key = `${nombre} (${(horas as number).toFixed(2)}h)`;
      desglose[key] = (desglose[key] || 0) + valor;
    }

    return desglose;
  }

  /**
   * Retorna el detalle de deducciones (base + manuales) como dict concepto->valor.
   */
  getDeduccionesDesglosadas(): Record<string, number> {
    const deducciones: Record<string, number> = {};

    // Calcular porcentajes del devengado (sin cívicas ni auxilio)
    for (const [concepto, porcentaje] of Object.entries(DEDUCCIONES_BASE)) {
      const valor = this.devengado * (porcentaje as number);
      deducciones[concepto] = valor;
    }

    // Agregar deducciones manuales
    for (const [concepto, valor] of this.deducciones_manuales) {
      deducciones[concepto] = (deducciones[concepto] || 0) + valor;
    }

    // Agregar suspensiones si existen
    if (this.dias_suspension > 0) {
      const diasText = `${this.dias_suspension} día${this.dias_suspension > 1 ? 's' : ''}`;
      deducciones[`Suspensión (${diasText})`] = this.dias_suspension * this.valor_dia_basico;
    }

    // Agregar licencias si existen
    if (this.dias_licencia > 0) {
      const diasText = `${this.dias_licencia} día${this.dias_licencia > 1 ? 's' : ''}`;
      deducciones[`Licencia (${diasText})`] = this.dias_licencia * this.valor_dia_basico;
    }

    return deducciones;
  }

  totalDeducciones(): number {
    return Object.values(this.getDeduccionesDesglosadas()).reduce((a, b) => a + b, 0);
  }

  /**
   * Indica si se agregó CP.
   */
  tieneCp(): boolean {
    return this.cp_agregado;
  }

  /**
   * Detecta suspensión/licencia (impacta el cálculo de cívicas).
   */
  tieneSuspension(): boolean {
    return this.dias_trabajados < 15 && this.dias_incapacidad === 0;
  }

  /**
   * Calcula cantidad y valor de cívicas según suspensión/licencia.
   */
  calcularCivicas(): void {
    this.civicas_cantidad = PASAJES_CIVICA_CANTIDAD;

    if (this.tieneSuspension()) {
      this.civicas_cantidad -= 2;
    }

    if (this.civicas_cantidad < 0) {
      this.civicas_cantidad = 0;
    }

    this.civicas_valor = this.civicas_cantidad * PASAJES_CIVICA_VALOR;
  }

  totalCivicas(): number {
    this.calcularCivicas();
    return this.civicas_valor;
  }

  /**
   * Calcula auxilio de transporte para quincena 30, descontando días no laborados.
   */
  totalAuxilio(): number {
    if (this.quincena === '30') {
      const valorDiarioAuxilio = AUXILIO_TRANSPORTE / 30;
      const diasDescuento = 15 - this.dias_trabajados + this.dias_incapacidad;
      const auxilio = AUXILIO_TRANSPORTE - diasDescuento * valorDiarioAuxilio;
      return Math.max(0, auxilio);
    }
    return 0;
  }

  /**
   * Retorna el resultado completo del cálculo
   */
  getResultado(turnosCount: number): PayrollResult {
    const devengado = this.devengado;
    const auxilio = this.totalAuxilio();
    const civicas = this.totalCivicas();
    const deducciones = this.totalDeducciones();
    const neto = devengado + auxilio + civicas - deducciones;

    return {
      devengado,
      auxilio,
      civicas,
      deducciones,
      neto,
      desglose_devengados: this.getDesgloseDevengados(),
      desglose_deducciones: this.getDeduccionesDesglosadas(),
      dias_trabajados: this.dias_trabajados,
      turnos_count: turnosCount,
      detalles_turnos: this.detalles_turnos,
      tiene_cp: this.tieneCp(),
      dias_incapacidad: this.dias_incapacidad,
      dias_suspension: this.dias_suspension,
      dias_licencia: this.dias_licencia,
    };
  }
}
