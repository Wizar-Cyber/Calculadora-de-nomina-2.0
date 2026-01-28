import streamlit as st
import pandas as pd
import json
from services.calculadora import CalculadoraNomina
from models.turno import Turno
from components.badge import render_badge

# Cargar turnos base
@st.cache_data(ttl=3600)
def _cargar_turnos_base():
    with open("turnos.json", encoding="utf-8") as f:
        data = json.load(f)
    return {t["codigo"]: Turno(t) for t in data}

turnos_base = _cargar_turnos_base()

def render_shift_table(registros: list):
    """
    Renderiza tabla moderna de turnos con columnas mejoradas y acciones inline
    
    Args:
        registros: Lista de tuplas (codigo, inicio, fin)
    """
    
    if not registros:
        # Estado vacío mejorado
        st.markdown("""
        <div class="data-table" style="
            text-align: center;
            padding: 60px 20px;
            background: rgba(255,255,255,0.95);
            border-radius: 12px;
            border: 2px dashed #e5e7eb;
            margin: 16px 0;
        ">
            <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
            <div style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">
                Sin turnos agregados
            </div>
            <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 24px;">
                Ingresa un código arriba o selecciona un evento
            </div>
            <div style="color: #3b82f6; font-size: 0.875rem; cursor: pointer;">
                📖 Ver códigos disponibles →
            </div>
        </div>
        """, unsafe_allow_html=True)
        return
    
    # Preparar datos para la tabla
    table_data = []
    for i, (codigo, inicio, fin) in enumerate(registros):
        # Determinar tipo de turno
        tipo = _determinar_tipo_turno(codigo)
        
        # Obtener detalles adicionales
        detalles = _obtener_detalles_turno(codigo, inicio, fin)
        
        table_data.append({
            'index': i,
            'codigo': codigo,
            'tipo': tipo,
            'horario': f"{inicio} - {fin}",
            'detalles': detalles
        })
    
    # Renderizar tabla HTML personalizada
    _render_modern_table(table_data)

def _determinar_tipo_turno(codigo: str) -> str:
    """Determina el tipo de turno para asignar color e icono"""
    if codigo == "SUSP":
        return "suspension"
    elif codigo == "LIC":
        return "licencia"
    elif codigo == "CP":
        return "cp"
    elif codigo == "INCAP":
        return "incapacidad"
    elif codigo == "DISPO":
        return "dispo"
    elif "CC" in codigo or "EXTRA" in codigo:
        return "extra"
    elif codigo.startswith(("D", "F", "N", "M", "T", "C")):
        return "normal"
    else:
        return "normal"

def _obtener_detalles_turno(codigo: str, inicio: str, fin: str) -> str:
    """Obtiene detalles adicionales del turno"""
    if codigo == "SUSP":
        return "Sin pago"
    elif codigo == "LIC":
        return "No remunerada"
    elif codigo == "CP":
        return "6h base"
    elif codigo == "INCAP":
        return "66.67% pago"
    elif codigo == "DISPO":
        return "Tiempo disponible"
    elif "EXTRA" in codigo:
        return "Horas extra"
    elif codigo in turnos_base:
        turno = turnos_base[codigo]
        detalles = []
        
        # Verificar si es nocturno
        if _es_turno_nocturno(turno):
            detalles.append("+Noc")
        
        # Verificar si es festivo
        if turno.festivo:
            detalles.append("+Dom")
        
        return " + ".join(detalles) if detalles else "Normal"
    else:
        return "-"

def _es_turno_nocturno(turno) -> bool:
    """Verifica si un turno incluye horas nocturnas"""
    try:
        from datetime import datetime
        inicio = datetime.strptime(turno.inicio, "%H:%M")
        fin = datetime.strptime(turno.fin, "%H:%M")
        return inicio.hour >= 21 or fin.hour >= 21 or fin.hour < 6
    except:
        return False

def _render_modern_table(table_data: list):
    """Renderiza la tabla moderna con HTML"""
    
    # Generar filas HTML
    rows_html = ""
    for row in table_data:
        rows_html += f"""
        <tr class="table-row" style="
            background: {'#f9fafb' if row['index'] % 2 == 0 else 'white'};
            transition: all 0.2s ease;
            cursor: pointer;
        " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background={'#f9fafb' if row['index'] % 2 == 0 else 'white'}">
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                {_get_tipo_icon(row['tipo'])}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                <span class="badge badge-{row['tipo']}" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    background: {_get_tipo_color(row['tipo'])};
                    color: white;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    font-family: 'Fira Code', monospace;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                ">
                    {row['codigo']}
                </span>
            </td>
            <td style="padding: 16px; color: #374151; font-weight: 500; border-bottom: 1px solid #e5e7eb;">
                {row['horario']}
            </td>
            <td style="padding: 16px; color: #6b7280; font-size: 0.875rem; border-bottom: 1px solid #e5e7eb;">
                {row['detalles']}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <button onclick="eliminarTurno({row['index']})" class="btn-delete" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                " onmouseover="this.style.background='#dc2626'; this.style.transform='translateY(-1px)'" 
                   onmouseout="this.style.background='#ef4444'; this.style.transform='translateY(0)'">
                    🗑️ Eliminar
                </button>
            </td>
        </tr>
        """
    
    # HTML completo de la tabla
    table_html = f"""
    <div class="data-table" style="
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin: 16px 0;
    ">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: linear-gradient(135deg, #f8fafc, #e2e8f0);">
                <tr>
                    <th style="padding: 16px; text-align: left; color: #374151; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em;">Tipo</th>
                    <th style="padding: 16px; text-align: left; color: #374151; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em;">Código</th>
                    <th style="padding: 16px; text-align: left; color: #374151; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em;">Horario</th>
                    <th style="padding: 16px; text-align: left; color: #374151; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em;">Detalle</th>
                    <th style="padding: 16px; text-align: right; color: #374151; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em;">⚙️</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
        <div style="
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 16px 24px;
            font-weight: 600;
            border-top: 2px solid #3b82f6;
            color: #1f2937;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <span>Total registros: {len(table_data)}</span>
            <span style="color: #6b7280; font-size: 0.875rem;">
                {len([r for r in table_data if r['tipo'] == 'normal'])} normales, 
                {len([r for r in table_data if r['tipo'] == 'extra'])} extras, 
                {len([r for r in table_data if r['tipo'] in ['suspension', 'licencia', 'incapacidad']])} eventos
            </span>
        </div>
    </div>
    
    <script>
    function eliminarTurno(index) {{
        // Confirmar eliminación
        if (confirm('¿Estás seguro de eliminar este turno?')) {{
            // Enviar evento a Streamlit
            const event = new CustomEvent('eliminar_turno', {{detail: {{index: index}}}});
            window.dispatchEvent(event);
        }}
    }}
    
    // Escuchar eventos de eliminación
    window.addEventListener('message', function(event) {{
        if (event.data.type === 'eliminar_turno') {{
            // Actualizar estado de Streamlit
            const input = document.querySelector('input[data-testid="stTextInput"]');
            if (input) {{
                input.value = '';
                input.dispatchEvent(new Event('input'));
            }}
        }}
    }});
    </script>
    """
    
    st.markdown(table_html, unsafe_allow_html=True)
    
    # Manejar eliminación a través de botones de Streamlit
    for i, row in enumerate(table_data):
        if st.button(f"Eliminar {row['codigo']}", key=f"delete_{i}", help=f"Eliminar turno {row['codigo']}"):
            _eliminar_turno(i)

def _eliminar_turno(index: int):
    """Elimina un turno y recalcula"""
    if index < len(st.session_state.turnos_reg):
        codigo, inicio, fin = st.session_state.turnos_reg[index]
        st.session_state.turnos_reg.pop(index)
        
        # Recalcular todo
        st.session_state.calc = CalculadoraNomina(quincena=st.session_state.quincena)
        for codigo_reg, inicio_reg, fin_reg in st.session_state.turnos_reg:
            if codigo_reg in turnos_base:
                st.session_state.calc.agregar_turno(turnos_base[codigo_reg])
        
        # Mostrar toast de eliminación
        st.markdown(f"""
        <div class="toast error" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            border-left: 4px solid #ef4444;
        ">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #ef4444; font-size: 20px;">✗</span>
                <div>
                    <div style="color: #1f2937; font-weight: 600;">Turno eliminado</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">{codigo} • {inicio}-{fin}</div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.rerun()

def _get_tipo_icon(tipo: str) -> str:
    """Obtiene el icono para un tipo de turno"""
    icon_map = {
        "normal": "🌅",
        "extra": "⚡",
        "suspension": "⚠️",
        "licencia": "📋",
        "cp": "💼",
        "incapacidad": "🏥",
        "dispo": "👤"
    }
    return icon_map.get(tipo, "🌅")

def _get_tipo_color(tipo: str) -> str:
    """Obtiene el color para un tipo de turno"""
    color_map = {
        "normal": "#3b82f6",
        "extra": "#8b5cf6",
        "suspension": "#f59e0b",
        "licencia": "#6b7280",
        "cp": "#3b82f6",
        "incapacidad": "#ef4444",
        "dispo": "#10b981"
    }
    return color_map.get(tipo, "#3b82f6")
