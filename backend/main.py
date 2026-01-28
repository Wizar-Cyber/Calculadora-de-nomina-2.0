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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.post("/api/eventos/cp")
def agregar_cp(data: CalculoRequest):
    """Agrega un compensatorio (CP)"""
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos existentes
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Agregar CP
    calc.agregar_cp()
    
    # Recalcular
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
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
        "tiene_cp": True
    }

@app.post("/api/eventos/suspension")
def agregar_suspension(data: CalculoRequest):
    """Agrega una suspensión"""
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos existentes
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Agregar suspensión
    calc.agregar_suspension()
    
    # Recalcular
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
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
        "tiene_suspension": True
    }

@app.post("/api/eventos/licencia")
def agregar_licencia(data: CalculoRequest):
    """Agrega una licencia no remunerada"""
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos existentes
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Agregar licencia
    calc.agregar_licencia()
    
    # Recalcular
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
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
        "tiene_licencia": True
    }

@app.post("/api/eventos/incapacidad")
def agregar_incapacidad(data: CalculoRequest):
    """Agrega una incapacidad"""
    from services.calculadora import CalculadoraNomina
    from models.turno import Turno
    
    calc = CalculadoraNomina(quincena=data.quincena)
    
    # Agregar turnos existentes
    for codigo in data.turnos:
        turno_data = next((t for t in turnos_data if t["codigo"] == codigo), None)
        if turno_data:
            turno = Turno(turno_data)
            calc.agregar_turno(turno)
    
    # Agregar incapacidad
    calc.agregar_incapacidad()
    
    # Recalcular
    devengado = calc.devengado
    auxilio = calc.total_auxilio()
    civicas = calc.total_civicas()
    deducciones = calc.total_deducciones()
    neto = devengado + auxilio + civicas - deducciones
    
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
        "dias_incapacidad": calc.dias_incapacidad,
        "tiene_incapacidad": True
    }

@app.post("/api/eventos/extra")
def agregar_extra(data: ExtraRequest):
    """Agrega horas extras"""
    from services.calculadora import CalculadoraNomina
    
    calc = CalculadoraNomina()
    calc.agregar_extra(data.minutos, data.recargo, data.nombre)
    
    return {
        "message": f"Extra agregada: {data.nombre}",
        "valor": data.minutos * (12409/60) * data.recargo
    }

@app.post("/api/eventos/deduccion")
def agregar_deduccion_manual(data: DeduccionManualRequest):
    """Agrega una deducción manual"""
    from services.calculadora import CalculadoraNomina
    
    calc = CalculadoraNomina()
    calc.agregar_deduccion_manual(data.nombre, data.valor)
    
    return {
        "message": f"Deducción agregada: {data.nombre}",
        "valor": data.valor
    }

@app.post("/api/eventos/dispo")
def agregar_dispo(data: DispoRequest):
    """Agrega tiempo disponible"""
    from services.calculadora import CalculadoraNomina
    
    calc = CalculadoraNomina()
    calc.agregar_dispo(data.inicio, data.fin, data.festivo)
    
    return {
        "message": f"Disponible agregado: {data.inicio}-{data.fin}",
        "inicio": data.inicio,
        "fin": data.fin,
        "festivo": data.festivo
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
