from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os

app = FastAPI(title="Nómina API", version="1.0.0")

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Cargar turnos
def cargar_turnos():
    """Carga los turnos desde el archivo JSON"""
    turnos_path = os.path.join(os.path.dirname(__file__), "data", "turnos.json")
    with open(turnos_path, encoding="utf-8") as f:
        return json.load(f)

turnos_data = cargar_turnos()

class TurnoRequest(BaseModel):
    codigo: str

class CalculoRequest(BaseModel):
    quincena: str
    turnos: List[str]  # Lista de códigos

class DeduccionManualRequest(BaseModel):
    nombre: str
    valor: float

class ExtraRequest(BaseModel):
    minutos: float
    recargo: float
    nombre: str

class DispoRequest(BaseModel):
    inicio: str
    fin: str
    festivo: bool

class ExtraConTurnosRequest(BaseModel):
    minutos: float
    recargo: float
    nombre: str
    quincena: str
    turnos: List[str]

class DeduccionConTurnosRequest(BaseModel):
    nombre: str
    valor: float
    quincena: str
    turnos: List[str]

class DispoConTurnosRequest(BaseModel):
    inicio: str
    fin: str
    festivo: bool
    quincena: str
    turnos: List[str]

class EventoData(BaseModel):
    tipo: str  # "suspension", "licencia", "incapacidad", "cp", "dispo", "extra", "deduccion"
    cantidad: int = 1  # Para suspension, licencia, incapacidad
    minutos: float = 0  # Para extra
    recargo: float = 1  # Para extra
    nombre: str = ""  # Para extra y deduccion
    valor: float = 0  # Para deduccion
    inicio: str = ""  # Para dispo
    fin: str = ""  # Para dispo
    festivo: bool = False  # Para dispo

class CalculoConEventosRequest(BaseModel):
    quincena: str
    turnos: List[str]
    eventos: List[EventoData] = []

@app.get("/")
def read_root():
    return {"message": "API de Nómina Conductores TA"}

@app.get("/api/turnos")
def get_turnos():
    """Retorna todos los turnos disponibles"""
    return {"turnos": turnos_data}

@app.get("/api/turnos/{codigo}")
def get_turno(codigo: str):
    """Retorna un turno específico"""
    turno = next((t for t in turnos_data if t["codigo"] == codigo), None)
    if not turno:
        return {"error": "Turno no encontrado"}, 404
    return turno

@app.post("/api/calcular")
def calcular_nomina(data: CalculoRequest):
    """
    Calcula la nómina completa
    Retorna: devengados, deducciones, neto, desglose
    """
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Calcular totales
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
    # Desglose completo
    return {
        "devengado": devengado,
        "auxilio": auxilio,
        "civicas": civicas,
        "deducciones": deducciones,
        "neto": neto,
        "desglose_devengados": calc.get_desglose_devengados(),
        "desglose_deducciones": calc.get_deducciones_desglosadas(),
        "dias_trabajados": calc.dias_trabajados,
        "turnos_count": len(data.turnos),
        "detalles_turnos": calc.detalles_turnos,
        "tiene_cp": calc.tiene_cp(),
        "dias_incapacidad": calc.dias_incapacidad
    }

@app.post("/api/calcular-con-eventos")
def calcular_nomina_con_eventos(data: CalculoConEventosRequest):
    """
    Calcula la nómina completa considerando turnos y eventos
    """
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Procesar eventos
    for evento in data.eventos:
        if evento.tipo == "suspension":
            for _ in range(evento.cantidad):
                calc.agregar_suspension()
        elif evento.tipo == "licencia":
            for _ in range(evento.cantidad):
                calc.agregar_licencia()
        elif evento.tipo == "incapacidad":
            for _ in range(evento.cantidad):
                calc.agregar_incapacidad()
        elif evento.tipo == "cp":
            calc.agregar_cp()
        elif evento.tipo == "extra":
            calc.agregar_extra(evento.minutos, evento.recargo, evento.nombre)
        elif evento.tipo == "deduccion":
            calc.agregar_deduccion_manual(evento.nombre, evento.valor)
        elif evento.tipo == "dispo":
            calc.agregar_dispo(evento.inicio, evento.fin, evento.festivo)
    
    # Calcular totales
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
    # Desglose completo
    return {
        "devengado": devengado,
        "auxilio": auxilio,
        "civicas": civicas,
        "deducciones": deducciones,
        "neto": neto,
        "desglose_devengados": calc.get_desglose_devengados(),
        "desglose_deducciones": calc.get_deducciones_desglosadas(),
        "dias_trabajados": calc.dias_trabajados,
        "turnos_count": len(data.turnos),
        "detalles_turnos": calc.detalles_turnos,
        "tiene_cp": calc.tiene_cp(),
        "dias_incapacidad": calc.dias_incapacidad,
        "dias_suspension": getattr(calc, 'dias_suspension', 0),
        "dias_licencia": getattr(calc, 'dias_licencia', 0)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
