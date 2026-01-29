const fs = require('fs');
const path = require('path');

class CalculadoraNomina {
  constructor(quincena = '30') {
    this.quincena = quincena;
    this.dias_quincena = quincena === '30' ? 15 : 15;
    this.salario_diario = 80000;
    this.turnos = [];
    this.suspensiones = 0;
    this.licencias = 0;
    this.incapacidades = 0;
    this.tiene_compensatorio = false;
    this.extras = [];
    this.deduccion_manual = [];
    this.detalles_turnos = [];
    this.dispo_data = [];
    this.dias_incapacidad = 0;
  }

  agregarTurno(turno) {
    this.turnos.push(turno);
    this.detalles_turnos.push({
      codigo: turno.codigo,
      nombre: turno.nombre,
      fecha: turno.fecha || 'N/A'
    });
  }

  agregarSuspension() {
    this.suspensiones += 1;
  }

  agregarLicencia() {
    this.licencias += 1;
  }

  agregarIncapacidad() {
    this.incapacidades += 1;
    this.dias_incapacidad += 1;
  }

  agregarCP() {
    this.tiene_compensatorio = true;
  }

  agregarExtra(minutos, recargo, nombre) {
    this.extras.push({
      minutos,
      recargo,
      nombre,
      valor: this.calcularValorExtra(minutos, recargo)
    });
  }

  agregarDeduccionManual(nombre, valor) {
    this.deduccion_manual.push({ nombre, valor });
  }

  agregarDispo(inicio, fin, festivo) {
    this.dispo_data.push({ inicio, fin, festivo });
  }

  calcularValorExtra(minutos, recargo) {
    const horas = minutos / 60;
    const tarifa_hora = this.salario_diario / 8;
    return Math.round(tarifa_hora * horas * recargo);
  }

  get devengado() {
    let total = 0;
    
    // Salario por días trabajados
    total += this.salario_diario * this.turnos.length;
    
    // CP (compensatorio)
    if (this.tiene_compensatorio) {
      total += this.salario_diario;
    }
    
    // Incapacidades (66.67%)
    total += Math.round(this.salario_diario * 0.6667 * this.incapacidades);
    
    // Extras
    this.extras.forEach(extra => {
      total += extra.valor;
    });
    
    return Math.round(total);
  }

  totalAuxilio() {
    const auxilio_diario = 25000;
    let dias = this.turnos.length + (this.tiene_compensatorio ? 1 : 0);
    dias += Math.round(this.incapacidades * 0.6667);
    return Math.round(auxilio_diario * dias);
  }

  totalCivicas() {
    const civicas_diarias = 2300;
    let dias = this.turnos.length + (this.tiene_compensatorio ? 1 : 0);
    dias += Math.round(this.incapacidades * 0.6667);
    return civicas_diarias * dias;
  }

  totalDeducciones() {
    const salud = this.devengado * 0.04;
    const pension = this.devengado * 0.04;
    const sura = this.devengado * 0.0522;
    
    let deduccion_manual_total = 0;
    this.deduccion_manual.forEach(d => {
      deduccion_manual_total += d.valor;
    });
    
    return Math.round(salud + pension + sura + deduccion_manual_total);
  }

  getDesgloseDevengados() {
    // Calcular cantidad de cívicas (normalmente son 2 pasajes por día, menos CP y suspensiones)
    let civicas_cantidad = 2 * (this.turnos.length || 0);
    if (this.tiene_compensatorio) {
      civicas_cantidad -= 1;
    }
    if (this.suspensiones > 0) {
      civicas_cantidad -= 2 * this.suspensiones;
    }
    if (civicas_cantidad < 0) {
      civicas_cantidad = 0;
    }

    const desglose = {
      [`Salario Básico (${this.turnos.length || 0} días)`]: this.salario_diario * this.turnos.length,
      [`Cívicas (${civicas_cantidad} pasajes)`]: this.totalCivicas(),
      'Auxilio de Transporte': this.totalAuxilio()
    };
    
    // Agregar extras con formato
    this.extras.forEach(extra => {
      const key = extra.nombre;
      if (!desglose[key]) {
        desglose[key] = 0;
      }
      desglose[key] += extra.valor;
    });
    
    return desglose;
  }

  getDesgloseDeducciones() {
    const salud = this.devengado * 0.04;
    const pension = this.devengado * 0.04;
    const sura = this.devengado * 0.0522;
    
    const desglose = {
      'EPS (4%)': Math.round(salud),
      'Pensión (4%)': Math.round(pension),
      'SURA (5.22%)': Math.round(sura)
    };
    
    this.deduccion_manual.forEach(d => {
      desglose[d.nombre] = d.valor;
    });
    
    return desglose;
  }

  tieneCp() {
    return this.tiene_compensatorio;
  }
}

module.exports = CalculadoraNomina;
