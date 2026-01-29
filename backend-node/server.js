const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const CalculadoraNomina = require('./services/calculadora');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'https://*.netlify.app'
  ],
  credentials: true
}));

// Cargar turnos
const turnosPath = path.join(__dirname, 'data', 'turnos.json');
let turnosData = [];

try {
  turnosData = JSON.parse(fs.readFileSync(turnosPath, 'utf-8'));
} catch (error) {
  console.error('Error cargando turnos:', error);
  turnosData = [];
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API de Nómina Conductores TA' });
});

app.get('/api/turnos', (req, res) => {
  res.json({ turnos: turnosData });
});

app.get('/api/turnos/:codigo', (req, res) => {
  const turno = turnosData.find(t => t.codigo === req.params.codigo);
  if (!turno) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }
  res.json(turno);
});

app.post('/api/calcular', (req, res) => {
  try {
    const { quincena, turnos } = req.body;
    
    const calc = new CalculadoraNomina(quincena);
    
    // Agregar turnos
    turnos.forEach(codigo => {
      const turnoData = turnosData.find(t => t.codigo === codigo);
      if (turnoData) {
        calc.agregarTurno(turnoData);
      }
    });
    
    // Calcular totales
    const devengado = calc.devengado;
    const auxilio = calc.totalAuxilio();
    const civicas = calc.totalCivicas();
    const deducciones = calc.totalDeducciones();
    const neto = devengado + auxilio + civicas - deducciones;
    
    res.json({
      devengado,
      auxilio,
      civicas,
      deducciones,
      neto,
      desglose_devengados: calc.getDesgloseDevengados(),
      desglose_deducciones: calc.getDesgloseDeducciones(),
      dias_trabajados: turnos.length,
      turnos_count: turnos.length,
      detalles_turnos: calc.detalles_turnos,
      tiene_cp: calc.tieneCp(),
      dias_incapacidad: calc.dias_incapacidad
    });
  } catch (error) {
    console.error('Error calculando:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/calcular-con-eventos', (req, res) => {
  try {
    const { quincena, turnos, eventos } = req.body;
    
    const calc = new CalculadoraNomina(quincena);
    
    // Agregar turnos
    turnos.forEach(codigo => {
      const turnoData = turnosData.find(t => t.codigo === codigo);
      if (turnoData) {
        calc.agregarTurno(turnoData);
      }
    });
    
    // Procesar eventos
    if (eventos && Array.isArray(eventos)) {
      eventos.forEach(evento => {
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
            calc.agregarCP();
            break;
          case 'extra':
            calc.agregarExtra(evento.minutos, evento.recargo, evento.nombre);
            break;
          case 'deduccion':
            calc.agregarDeduccionManual(evento.nombre, evento.valor);
            break;
          case 'dispo':
            calc.agregarDispo(evento.inicio, evento.fin, evento.festivo);
            break;
        }
      });
    }
    
    // Calcular totales
    const devengado = calc.devengado;
    const auxilio = calc.totalAuxilio();
    const civicas = calc.totalCivicas();
    const deducciones = calc.totalDeducciones();
    const neto = devengado + auxilio + civicas - deducciones;
    
    res.json({
      devengado,
      auxilio,
      civicas,
      deducciones,
      neto,
      desglose_devengados: calc.getDesgloseDevengados(),
      desglose_deducciones: calc.getDesgloseDeducciones(),
      dias_trabajados: turnos.length,
      turnos_count: turnos.length,
      detalles_turnos: calc.detalles_turnos,
      tiene_cp: calc.tieneCp(),
      dias_incapacidad: calc.dias_incapacidad,
      dias_suspension: calc.suspensiones,
      dias_licencia: calc.licencias
    });
  } catch (error) {
    console.error('Error calculando con eventos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos del frontend
const frontendBuildPath = path.join(__dirname, '..', 'frontend', '.next', 'public');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
