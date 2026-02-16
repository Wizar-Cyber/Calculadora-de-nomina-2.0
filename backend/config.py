"""Constantes y parámetros de negocio para el cálculo de nómina."""

# ----------------------------
# SALARIO / JORNADA
# ----------------------------
SALARIO_BASICO_MENSUAL = 2347526
SALARIO_QUINCENA = SALARIO_BASICO_MENSUAL / 2

HORAS_JORNADA = 6
VALOR_HORA = 13041.81  # Salario / 30 / 6
VALOR_MINUTO = VALOR_HORA / 60

# ----------------------------
# AUXILIO / CÍVICAS
# ----------------------------
AUXILIO_TRANSPORTE = 249095  # Mensual
PASAJES_CIVICA_CANTIDAD = 24
PASAJES_CIVICA_VALOR = 3820

# ----------------------------
# DEDUCCIONES
# ----------------------------
DEDUCCIONES_BASE = {
    "Salud": 0.04,
    "Pensión": 0.04,
}

# ----------------------------
# RECARGOS
# ----------------------------
# Porcentajes de recargo (se suman al valor hora base)
RECARGO_ORDINARIO_NOCTURNO = 0.35  # +35%
RECARGO_DOMINICAL_DIURNO = 0.80    # +80%
RECARGO_DOMINICAL_NOCTURNO = 2.10  # +210%

FRANJA_DIURNA = (6, 19)  # 6:00 AM - 7:00 PM
FRANJA_NOCTURNA = (19, 6)  # 7:00 PM - 6:00 AM
