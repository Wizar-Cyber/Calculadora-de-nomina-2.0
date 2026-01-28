import streamlit as st
import json
from datetime import datetime
from models.turno import Turno
from services.calculadora import CalculadoraNomina
from config import SALARIO_QUINCENA, VALOR_HORA
import os

# Importar componentes custom
from components.navigation import render_navigation
from components.badge import render_badge
from components.money_display import render_money
from components.shift_table import render_shift_table
from components.smart_input import render_smart_input, render_atajos_teclado

# Configuración de página
st.set_page_config(
    page_title="Nómina Conductores TA",
    page_icon="🧮",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Aplicar estilos CSS directamente
def apply_css():
    css = """
    <style>
    /* ESTILOS AGRESIVOS PARA BOTONES */
    .stButton button {
        background: #10b981 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    }
    
    .stButton button:hover {
        background: #059669 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transform: translateY(-1px) !important;
    }
    
    /* FORZAR COLORES ESPECÍFICOS */
    div[data-testid="stButton"] button {
        background: #10b981 !important;
        color: white !important;
        border: none !important;
    }
    
    /* BOTONES ESPECÍFICOS POR TEXTO */
    button:has(span), button:has(div) {
        background: #10b981 !important;
        color: white !important;
        border: none !important;
    }
    
    /* ESTILOS BASE */
    .stApp {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        color: white;
    }
    
    /* Labels y texto */
    label {
        color: white !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        margin-bottom: 8px !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7) !important;
    }
    
    .stMarkdown {
        color: white !important;
    }
    
    .stMarkdown h1, .stMarkdown h2, .stMarkdown h3 {
        color: white !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    
    /* Inputs */
    .stSelectbox > div > div > select,
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input {
        background: rgba(255, 255, 255, 0.95) !important;
        color: #1f2937 !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 8px !important;
        font-weight: 500 !important;
        padding: 12px 16px !important;
    }
    
    /* Cards personalizados */
    .payroll-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
        border-left: 4px solid #10b981;
    }
    
    .payroll-card.deduccion {
        border-left-color: #ef4444;
    }
    
    .payroll-card.neto {
        border-left-color: #3b82f6;
        border: 2px solid #3b82f6;
    }
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

apply_css()

# CSS adicional para forzar colores de botones
st.markdown("""
<style>
/* FORZAR BOTONES VERDES */
.stButton button {
    background: #10b981 !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
}

.stButton button:hover {
    background: #059669 !important;
    color: white !important;
}

/* Todos los selectores posibles */
div[data-testid="stButton"] button,
button[data-testid="stButton"],
.kb-button,
button {
    background: #10b981 !important;
    color: white !important;
    border: none !important;
}

/* Forzar con !important repetido */
.stButton button,
.stButton button *,
div[data-testid="stButton"] button,
div[data-testid="stButton"] button * {
    background: #10b981 !important;
    color: white !important;
    border: none !important;
}
</style>
""", unsafe_allow_html=True)

# Funciones auxiliares para toasts y modales
def _mostrar_toast(mensaje: str, tipo: str = "success"):
    """Muestra una notificación toast"""
    color_map = {
        "success": "#10b981",
        "error": "#ef4444", 
        "warning": "#f59e0b"
    }
    icon_map = {
        "success": "✓",
        "error": "✗",
        "warning": "⚠️"
    }
    
    color = color_map.get(tipo, "#10b981")
    icon = icon_map.get(tipo, "✓")
    
    st.markdown(f"""
    <div class="toast {tipo}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid {color};
    ">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: {color}; font-size: 20px;">{icon}</span>
            <div style="color: #1f2937; font-weight: 600;">{mensaje}</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def _mostrar_toast_evento(titulo: str, codigo: str, detalle: str):
    """Muestra toast específico para eventos"""
    st.markdown(f"""
    <div class="toast success" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid #f59e0b;
    ">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #f59e0b; font-size: 20px;">⚠️</span>
            <div>
                <div style="color: #1f2937; font-weight: 600;">{titulo}</div>
                <div style="color: #6b7280; font-size: 0.875rem;">{codigo} • {detalle}</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# Cargar datos
@st.cache_data(ttl=3600)
def _cargar_turnos_base():
    with open("turnos.json", encoding="utf-8") as f:
        data = json.load(f)
    return {t["codigo"]: Turno(t) for t in data}

turnos_base = _cargar_turnos_base()

# Inicializar session state
if "calc" not in st.session_state:
    st.session_state.quincena = "30"
    st.session_state.calc = CalculadoraNomina(quincena="30")
    st.session_state.turnos_reg = []
    st.session_state.deducciones_reg = []
    st.session_state.current_tab = "🏠 Configuración"
    st.session_state.codigo_turno = ""

# HEADER FIJO
st.markdown(f"""
<div class="mobile-header" style="
    background: linear-gradient(135deg, #1e293b, #334155);
    padding: 20px 32px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
">
    <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 2rem;">🧮</span>
        <h1 style="margin: 0; color: white; font-size: 1.75rem;">Nómina Conductores TA</h1>
    </div>
    <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
            <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-transform: uppercase;">Quincena</div>
            <div style="color: white; font-size: 1.5rem; font-weight: 700;">{st.session_state.quincena}</div>
        </div>
        <div style="text-align: center;">
            <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-transform: uppercase;">Turnos</div>
            <div style="color: white; font-size: 1.5rem; font-weight: 700;">{len(st.session_state.turnos_reg)}/15</div>
        </div>
        <div style="text-align: center;">
            <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-transform: uppercase;">Neto</div>
            <div style="color: #10b981; font-size: 1.5rem; font-weight: 700;">
                ${(st.session_state.calc.devengado + st.session_state.calc.total_auxilio() + st.session_state.calc.total_civicas() - st.session_state.calc.total_deducciones()):,.0f}
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# NAVEGACIÓN
current_tab = render_navigation()

# ========== TAB 1: CONFIGURACIÓN ==========
if current_tab == "🏠 Configuración":
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### 🎯 Agregar Turno", unsafe_allow_html=True)
        
        # Selectbox para quincena
        quincena = st.selectbox(
            "Seleccionar Quincena",
            ["15", "30"],
            index=1 if st.session_state.quincena == "30" else 0,
            key="select_quincena",
            help="Quincena 15: días 1-15 | Quincena 30: días 16-30"
        )
        
        if quincena != st.session_state.quincena:
            st.session_state.quincena = quincena
            st.session_state.calc = CalculadoraNomina(quincena=quincena)
            st.rerun()
        
        # Input inteligente con autocompletado y validación
        codigo_norm, es_valido = render_smart_input(turnos_base, key="codigo_turno")
        
        # Botón agregar (solo se muestra si hay código válido)
        if es_valido:
            if st.button("➕ Agregar Turno", type="primary", use_container_width=True, key="btn_agregar_turno"):
                t = turnos_base[codigo_norm]
                st.session_state.calc.agregar_turno(t)
                st.session_state.turnos_reg.append((codigo_norm, t.inicio, t.fin))
                st.success(f"✓ Turno {codigo_norm} agregado: {t.inicio}-{t.fin}")
                # No modificar session_state.codigo_turno aquí
                st.rerun()
        
        # Mostrar atajos de teclado (oculto)
        # render_atajos_teclado()
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### ⚡ Acciones Rápidas", unsafe_allow_html=True)
        
        # Fila 1: Botones principales
        col_btn1, col_btn2, col_btn3 = st.columns(3)
        
        with col_btn1:
            st.markdown("""
            <style>
            .btn-suspension {
                background: #f59e0b !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("⚠️ Suspensión", use_container_width=True, key="btn_suspension", help="Descuenta 1 día del básico sin afectar prestaciones"):
                st.session_state.calc.agregar_suspension()
                st.session_state.turnos_reg.append(("SUSP", "-", "-"))
                st.success("✓ Suspensión agregada")
                st.rerun()
        
        with col_btn2:
            st.markdown("""
            <style>
            .btn-licencia {
                background: #6b7280 !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("📋 Licencia", use_container_width=True, key="btn_licencia", help="Descuenta 1 día del básico sin afectar prestaciones"):
                st.session_state.calc.agregar_licencia()
                st.session_state.turnos_reg.append(("LIC", "-", "-"))
                st.success("✓ Licencia agregada")
                st.rerun()
        
        with col_btn3:
            st.markdown("""
            <style>
            .btn-cp {
                background: #3b82f6 !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("💼 CP", use_container_width=True, key="btn_cp", help="Agrega 6 horas básicas al devengado"):
                st.session_state.calc.agregar_cp()
                st.session_state.turnos_reg.append(("CP", "-", "-"))
                st.success("✓ Compensatorio agregado")
                st.rerun()
        
        # Fila 2: Botones secundarios
        col_btn4, col_btn5, col_btn6 = st.columns(3)
        
        with col_btn4:
            st.markdown("""
            <style>
            .btn-incapacidad {
                background: #ef4444 !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("🏥 Incapacidad", use_container_width=True, key="btn_incapacidad", help="Paga al 66.67% y reduce días trabajados"):
                st.session_state.calc.agregar_incapacidad()
                st.session_state.turnos_reg.append(("INCAP", "-", "-"))
                st.success("✓ Incapacidad agregada")
                st.rerun()
        
        with col_btn5:
            st.markdown("""
            <style>
            .btn-reset {
                background: #ef4444 !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("🔄 Reset", use_container_width=True, key="btn_reset", help="Elimina todos los turnos y reinicia cálculos"):
                if st.session_state.turnos_reg:
                    st.session_state.calc = CalculadoraNomina(quincena=st.session_state.quincena)
                    st.session_state.turnos_reg = []
                    st.session_state.deducciones_reg = []
                    st.warning("Todos los turnos eliminados")
                    st.rerun()
        
        with col_btn6:
            st.markdown("""
            <style>
            .btn-ayuda {
                background: #10b981 !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
            }
            </style>
            """, unsafe_allow_html=True)
            if st.button("❓ Ayuda", use_container_width=True, key="btn_ayuda"):
                st.session_state.show_help = not st.session_state.get('show_help', False)
                st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Opciones adicionales
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### ⏰ Opciones Adicionales", unsafe_allow_html=True)
        
        # EXTRAS
        with st.expander("⚡ Agregar Horas Extras", expanded=False):
            col1, col2 = st.columns(2)
            with col1:
                minutos_extra = st.number_input(
                    "Minutos extras",
                    min_value=1,
                    max_value=480,
                    value=60,
                    step=15,
                    help="Cantidad de minutos de trabajo extra"
                )
            with col2:
                tipo_extra = st.selectbox(
                    "Tipo de extra",
                    options=[
                        ("Diurno (1.25)", 1.25),
                        ("Nocturno (1.75)", 1.75),
                        ("Festivo Diurno (2.0)", 2.0),
                        ("Festivo Nocturno (2.5)", 2.5)
                    ],
                    help="Factor de recargo según tipo de hora extra"
                )
            
            if st.button("➕ Agregar Extra", type="primary", use_container_width=True):
                nombre_extra = f"Extra {tipo_extra.split('(')[0].strip()}"
                st.session_state.calc.agregar_extra(minutos_extra, tipo_extra, nombre_extra)
                st.session_state.turnos_reg.append(("EXTRA", f"{minutos_extra}min", f"{tipo_extra}x"))
                st.success(f"✓ {nombre_extra} agregado")
                st.rerun()
        
        # DEDUCCIÓN
        with st.expander("📉 Agregar Deducción", expanded=False):
            concepto_deduccion = st.text_input(
                "Concepto de deducción",
                placeholder="Ej: Préstamo, Fondo, Seguro...",
                help="Nombre o descripción de la deducción"
            )
            valor_deduccion = st.number_input(
                "Valor de deducción",
                min_value=0,
                step=1000,
                value=0,
                help="Monto a descontar"
            )
            
            if st.button("➕ Agregar Deducción", type="primary", use_container_width=True):
                if concepto_deduccion and valor_deduccion > 0:
                    st.session_state.calc.agregar_deduccion_manual(concepto_deduccion, valor_deduccion)
                    st.session_state.deducciones_reg.append((concepto_deduccion, valor_deduccion))
                    st.success(f"✓ Deducción '{concepto_deduccion}' agregada")
                    st.rerun()
                else:
                    st.error("❌ Debes ingresar concepto y valor mayor a 0")
        
        # DISPO
        with st.expander("👤 Agregar Tiempo Disponible", expanded=False):
            col1, col2 = st.columns(2)
            with col1:
                inicio_dispo = st.time_input(
                    "Hora inicio",
                    value=datetime.strptime("08:00", "%H:%M").time(),
                    help="Hora de inicio del tiempo disponible"
                )
            with col2:
                fin_dispo = st.time_input(
                    "Hora fin",
                    value=datetime.strptime("16:00", "%H:%M").time(),
                    help="Hora de fin del tiempo disponible"
                )
            
            festivo_dispo = st.checkbox("¿Es día festivo?", help="Marcar si es un día festivo")
            
            if st.button("➕ Agregar Disponible", type="primary", use_container_width=True):
                inicio_str = inicio_dispo.strftime("%H:%M")
                fin_str = fin_dispo.strftime("%H:%M")
                st.session_state.calc.agregar_dispo(inicio_str, fin_str, festivo_dispo)
                st.session_state.turnos_reg.append(("DISPO", inicio_str, fin_str))
                st.success(f"✓ Tiempo disponible {inicio_str}-{fin_str} agregado")
                st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)

# ========== TAB 2: REGISTROS ==========
elif current_tab == "📋 Registros":
    
    st.markdown("### 📊 Turnos Agregados", unsafe_allow_html=True)
    
    if not st.session_state.turnos_reg:
        st.info("📋 Sin turnos agregados. Ingresa un código en la pestaña de Configuración.")
    else:
        # Tabla simple usando Streamlit nativo
        import pandas as pd
        
        # Preparar datos para la tabla
        tabla_datos = []
        for i, (codigo, inicio, fin) in enumerate(st.session_state.turnos_reg):
            # Determinar tipo y detalles
            if codigo == "SUSP":
                tipo = "⚠️ Suspensión"
                detalles = "Sin pago"
            elif codigo == "LIC":
                tipo = "📋 Licencia"
                detalles = "No remunerada"
            elif codigo == "CP":
                tipo = "💼 Compensatorio"
                detalles = "6h base"
            elif codigo == "INCAP":
                tipo = "🏥 Incapacidad"
                detalles = "66.67% pago"
            elif codigo == "DISPO":
                tipo = "👤 Disponible"
                detalles = "Tiempo disponible"
            elif "EXTRA" in codigo:
                tipo = "⚡ Extra"
                detalles = "Horas extra"
            else:
                tipo = f"🌅 {codigo}"
                detalles = f"{inicio} - {fin}"
            
            tabla_datos.append({
                "#": i + 1,
                "Código": codigo,
                "Tipo": tipo,
                "Horario": f"{inicio} - {fin}",
                "Detalles": detalles
            })
        
        df = pd.DataFrame(tabla_datos)
        st.dataframe(df, use_container_width=True, hide_index=True)
        
        # Botón de eliminar todos
        if st.button("🗑️ Eliminar Todos", type="secondary", use_container_width=True):
            st.session_state.calc = CalculadoraNomina(quincena=st.session_state.quincena)
            st.session_state.turnos_reg = []
            st.session_state.deducciones_reg = []
            st.warning("Todos los turnos eliminados")
            st.rerun()

# ========== TAB 3: RESULTADO ==========
elif current_tab == "💰 Resultado":
    
    st.markdown("### 💵 Colilla de Nómina", unsafe_allow_html=True)
    
    # Preparar datos
    dev = st.session_state.calc.devengado
    auxilio = st.session_state.calc.total_auxilio()
    civicas = st.session_state.calc.total_civicas()
    ded = st.session_state.calc.total_deducciones()
    neto = dev + auxilio + civicas - ded
    
    # Cards en columnas
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div style="
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #10b981;
        ">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 700;">
                💵 DEVENGADOS
            </h3>
        """, unsafe_allow_html=True)
        
        # Items devengado
        dias_full = st.session_state.calc.dias_trabajados
        valor_dia = st.session_state.calc.valor_dia_basico
        
        st.markdown(f"""
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #374151;">Salario Básico</span>
            <span style="color: #1f2937; font-weight: 600;">${dias_full * valor_dia:,.0f}</span>
        </div>
        """, unsafe_allow_html=True)
        
        for concepto, datos in st.session_state.calc.recargos_agrupados.items():
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #374151;">{concepto}</span>
                <span style="color: #1f2937; font-weight: 600;">${datos['valor']:,.0f}</span>
            </div>
            """, unsafe_allow_html=True)
        
        if civicas > 0:
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #374151;">Cívicas</span>
                <span style="color: #1f2937; font-weight: 600;">${civicas:,.0f}</span>
            </div>
            """, unsafe_allow_html=True)
        
        if auxilio > 0:
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #374151;">Auxilio Transporte</span>
                <span style="color: #1f2937; font-weight: 600;">${auxilio:,.0f}</span>
            </div>
            """, unsafe_allow_html=True)
        
        # Total devengado
        total_dev = dev + auxilio + civicas
        st.markdown(f"""
        <div style="display: flex; justify-content: space-between; padding: 16px 0 0 0; border-top: 2px solid #10b981; margin-top: 8px;">
            <span style="color: #1f2937; font-weight: 700; font-size: 1.125rem;">TOTAL</span>
            <span style="color: #10b981; font-weight: 800; font-size: 1.5rem;">${total_dev:,.0f}</span>
        </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style="
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #ef4444;
        ">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 700;">
                📉 DEDUCCIONES
            </h3>
        """, unsafe_allow_html=True)
        
        # Items deducción
        deducciones_desglose = st.session_state.calc.get_deducciones_desglosadas()
        for concepto, valor in deducciones_desglose.items():
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #374151;">{concepto}</span>
                <span style="color: #1f2937; font-weight: 600;">${valor:,.0f}</span>
            </div>
            """, unsafe_allow_html=True)
        
        # Total deducciones
        st.markdown(f"""
        <div style="display: flex; justify-content: space-between; padding: 16px 0 0 0; border-top: 2px solid #ef4444; margin-top: 8px;">
            <span style="color: #1f2937; font-weight: 700; font-size: 1.125rem;">TOTAL</span>
            <span style="color: #ef4444; font-weight: 800; font-size: 1.5rem;">${ded:,.0f}</span>
        </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Card de neto destacado
    st.markdown(f"""
    <div style="
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1));
        border: 3px solid #3b82f6;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1);
        margin: 24px 0;
    ">
        <div style="
            font-size: 1rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
            font-weight: 600;
        ">
            NETO A PAGAR
        </div>
        <div style="
            font-size: 4rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 24px;
            font-family: monospace;
        ">
            ${neto:,.0f}
        </div>
        <div style="display: flex; justify-content: center; gap: 32px; margin-bottom: 24px;">
            <div>
                <div style="color: #10b981; font-weight: 600; font-size: 0.875rem;">Devengado</div>
                <div style="color: #1f2937; font-weight: 700;">${total_dev:,.0f}</div>
            </div>
            <div>
                <div style="color: #ef4444; font-weight: 600; font-size: 0.875rem;">Deducciones</div>
                <div style="color: #1f2937; font-weight: 700;">${ded:,.0f}</div>
            </div>
        </div>
        <div style="
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 24px;
        ">
            <div style="display: flex; height: 100%;">
                <div style="background: #10b981; width: {(total_dev/(total_dev+ded))*100}%;"></div>
                <div style="background: #ef4444; width: {(ded/(total_dev+ded))*100}%;"></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# FOOTER
st.markdown("""
<div style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    color: rgba(255,255,255,0.5);
    font-size: 0.75rem;
    font-style: italic;
    z-index: 999;
">
    Power by: <strong>Reiber</strong>
</div>
""", unsafe_allow_html=True)
