import streamlit as st
from streamlit_option_menu import option_menu

def render_navigation():
    """
    Renderiza navegación con tabs horizontales modernos
    """
    selected = option_menu(
        menu_title=None,
        options=["🏠 Configuración", "📋 Registros", "💰 Resultado"],
        icons=["gear", "list-task", "currency-dollar"],
        default_index=0,
        orientation="horizontal",
        styles={
            "container": {
                "padding": "0!important",
                "background-color": "transparent!important",
                "margin-bottom": "24px!important",
                "display": "flex!important",
                "gap": "8px!important"
            },
            "nav-link": {
                "font-size": "14px!important",
                "text-align": "center!important",
                "margin": "0px!important",
                "padding": "12px 24px!important",
                "background-color": "rgba(255,255,255,0.1)!important",
                "color": "white!important",
                "border-radius": "12px!important",
                "font-weight": "600!important",
                "transition": "all 0.2s ease!important",
                "border": "1px solid rgba(255,255,255,0.2)!important",
                "backdrop-filter": "blur(10px)!important"
            },
            "nav-link:hover": {
                "background-color": "rgba(255,255,255,0.2)!important",
                "transform": "translateY(-1px)!important",
                "box-shadow": "0 4px 6px rgba(0,0,0,0.1)!important"
            },
            "nav-link-selected": {
                "background": "linear-gradient(135deg, #3b82f6, #2563eb)!important",
                "color": "white!important",
                "box-shadow": "0 4px 12px rgba(59, 130, 246, 0.3)!important",
                "border-color": "#3b82f6!important",
                "transform": "translateY(-1px)!important"
            },
        }
    )
    
    return selected
