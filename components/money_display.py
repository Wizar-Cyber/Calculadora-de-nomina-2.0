import streamlit as st
from styles.colors import *

def render_money(amount: float, type: str = "neutral", size: str = "medium"):
    """
    Renderiza un valor monetario con formato y estilo
    
    Args:
        amount: Valor numérico
        type: devengado, deduccion, neutral
        size: small, medium, large
    """
    color_map = {
        "devengado": COLOR_DEVENGADO,
        "deduccion": COLOR_DEDUCCION,
        "neutral": COLOR_PRIMARY
    }
    
    size_map = {
        "small": "1.5rem",
        "medium": "3rem",
        "large": "4rem"
    }
    
    color = color_map.get(type, COLOR_PRIMARY)
    font_size = size_map.get(size, "3rem")
    
    money_html = f"""
    <div style="
        font-size: {font_size};
        font-weight: 800;
        color: {color};
        line-height: 1;
        font-variant-numeric: tabular-nums;
    ">
        ${amount:,.0f}
    </div>
    """
    
    st.markdown(money_html, unsafe_allow_html=True)
