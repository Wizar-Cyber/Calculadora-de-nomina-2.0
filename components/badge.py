import streamlit as st

def render_badge(text: str, type: str = "normal"):
    """
    Renderiza un badge con colores semánticos modernos
    
    Args:
        text: Texto del badge
        type: normal, extra, suspension, licencia, cp, incapacidad
    """
    # Mapa de colores semánticos
    color_map = {
        "normal": "#3b82f6",      # Azul para turnos normales
        "extra": "#8b5cf6",       # Púrpura para extras/recargos
        "suspension": "#f59e0b",  # Amarillo para alertas/advertencias
        "licencia": "#6b7280",    # Gris para neutrales
        "cp": "#3b82f6",          # Azul para compensatorios
        "incapacidad": "#ef4444", # Rojo para eventos negativos
        "dispo": "#10b981",       # Verde para tiempo disponible
        "suspen": "#f59e0b",      # Amarillo para suspensión
        "lic": "#6b7280",         # Gris para licencia
        "incap": "#ef4444"        # Rojo para incapacidad
    }
    
    # Mapa de iconos
    icon_map = {
        "normal": "🌅",
        "extra": "⚡",
        "suspension": "⚠️",
        "licencia": "📋",
        "cp": "💼",
        "incapacidad": "🏥",
        "dispo": "👤",
        "suspen": "⚠️",
        "lic": "📋",
        "incap": "�"
    }
    
    # Detectar tipo por código si no coincide directamente
    if type not in color_map:
        if text.startswith(("D", "F", "N", "M", "T", "C")):
            type = "normal"
        elif "CC" in text or "EXTRA" in text:
            type = "extra"
        elif text == "SUSP":
            type = "suspension"
        elif text == "LIC":
            type = "licencia"
        elif text == "CP":
            type = "cp"
        elif text == "INCAP":
            type = "incapacidad"
        elif text == "DISPO":
            type = "dispo"
        else:
            type = "normal"
    
    color = color_map.get(type, "#3b82f6")
    icon = icon_map.get(type, "")
    
    badge_html = f"""
    <span class="badge badge-{type}" style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        background: {color};
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        font-family: 'Fira Code', 'Courier New', monospace;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    ">
        {icon} {text}
    </span>
    """
    
    st.markdown(badge_html, unsafe_allow_html=True)
