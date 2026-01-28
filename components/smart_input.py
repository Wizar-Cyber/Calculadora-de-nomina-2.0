import streamlit as st
import json
from typing import List, Tuple, Optional

def render_smart_input(turnos_base: dict, key: str = "codigo_turno") -> Tuple[str, bool]:
    """
    Renderiza un input inteligente con autocompletado y validación visual
    
    Args:
        turnos_base: Diccionario de turnos disponibles
        key: Key para el input de Streamlit
        
    Returns:
        Tuple con (codigo_normalizado, es_valido)
    """
    # Obtener lista de códigos disponibles
    codigos_disponibles = list(turnos_base.keys())
    
    # Container para el input con validación
    with st.container():
        # Input con placeholder mejorado
        codigo = st.text_input(
            "🎯 Código del Turno",
            placeholder="Ej: D1, 162CC, 284M...",
            key=key,
            help="Escribe el código del turno o usa las flechas para navegar sugerencias"
        )
        
        # Normalizar código
        codigo_norm = (codigo or "").strip().upper()
        
        # Validación visual en tiempo real
        if codigo_norm:
            if codigo_norm in turnos_base:
                # Código válido - mostrar feedback positivo
                st.markdown("""
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid #10b981;
                    border-radius: 6px;
                    margin-top: 8px;
                    animation: fadeIn 0.2s ease-out;
                ">
                    <span style="color: #10b981; font-weight: 600;">✓</span>
                    <span style="color: #10b981; font-size: 0.875rem;">Código válido</span>
                </div>
                """, unsafe_allow_html=True)
                
                # Mostrar detalles del turno
                turno = turnos_base[codigo_norm]
                st.markdown(f"""
                <div style="
                    padding: 8px 12px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 6px;
                    margin-top: 4px;
                ">
                    <div style="color: #1f2937; font-size: 0.875rem;">
                        <strong>Horario:</strong> {turno.inicio} - {turno.fin}
                        {f" | <strong>Festivo:</strong> ✅" if turno.festivo else ""}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                es_valido = True
                
            else:
                # Código inválido - mostrar feedback negativo y sugerencias
                st.markdown("""
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid #ef4444;
                    border-radius: 6px;
                    margin-top: 8px;
                    animation: shake 0.3s ease-in-out;
                ">
                    <span style="color: #ef4444; font-weight: 600;">✗</span>
                    <span style="color: #ef4444; font-size: 0.875rem;">Código no encontrado</span>
                </div>
                """, unsafe_allow_html=True)
                
                # Buscar sugerencias similares
                sugerencias = _buscar_sugerencias_similares(codigo_norm, codigos_disponibles)
                
                if sugerencias:
                    st.markdown("**¿Quizás quisiste decir?**")
                    cols = st.columns(min(3, len(sugerencias)))
                    for i, sugerencia in enumerate(sugerencias[:3]):
                        with cols[i]:
                            if st.button(sugerencia, key=f"sugerencia_{sugerencia}", use_container_width=True):
                                # Actualizar el input con la sugerencia
                                st.session_state[key] = sugerencia
                                st.rerun()
                
                es_valido = False
        else:
            es_valido = False
        
        # Mostrar códigos disponibles
        with st.expander("📖 Ver códigos disponibles", expanded=False):
            _mostrar_codigos_disponibles(turnos_base)
        
        return codigo_norm, es_valido

def _buscar_sugerencias_similares(codigo: str, disponibles: List[str]) -> List[str]:
    """
    Busca códigos similares usando distancia de Levenshtein simplificada
    """
    sugerencias = []
    
    for disp in disponibles:
        # Coincidencia exacta al inicio
        if disp.startswith(codigo):
            sugerencias.append(disp)
            continue
        
        # Coincidencia parcial
        if any(char in disp for char in codigo):
            sugerencias.append(disp)
    
    # Ordenar por relevancia (prioridad a coincidencias al inicio)
    sugerencias.sort(key=lambda x: (not x.startswith(codigo), len(x)))
    
    return sugerencias[:5]  # Máximo 5 sugerencias

def _mostrar_codigos_disponibles(turnos_base: dict):
    """
    Muestra una tabla con los códigos disponibles organizados por tipo
    """
    from components.badge import render_badge
    
    # Organizar turnos por tipo
    turnos_normales = []
    turnos_festivos = []
    turnos_nocturnos = []
    
    for codigo, turno in turnos_base.items():
        if turno.festivo:
            turnos_festivos.append((codigo, turno))
        elif _es_turno_nocturno(turno):
            turnos_nocturnos.append((codigo, turno))
        else:
            turnos_normales.append((codigo, turno))
    
    # Mostrar en tabs
    tab1, tab2, tab3 = st.tabs(["🌅 Normales", "🎉 Festivos", "🌙 Nocturnos"])
    
    with tab1:
        if turnos_normales:
            for codigo, turno in turnos_normales[:10]:  # Limitar a 10 por tab
                col1, col2 = st.columns([1, 3])
                with col1:
                    render_badge(codigo, "normal")
                with col2:
                    st.markdown(f"{turno.inicio}-{turno.fin}")
        else:
            st.info("No hay turnos normales")
    
    with tab2:
        if turnos_festivos:
            for codigo, turno in turnos_festivos[:10]:
                col1, col2 = st.columns([1, 3])
                with col1:
                    render_badge(codigo, "extra")
                with col2:
                    st.markdown(f"{turno.inicio}-{turno.fin} 🎉")
        else:
            st.info("No hay turnos festivos")
    
    with tab3:
        if turnos_nocturnos:
            for codigo, turno in turnos_nocturnos[:10]:
                col1, col2 = st.columns([1, 3])
                with col1:
                    render_badge(codigo, "normal")
                with col2:
                    st.markdown(f"{turno.inicio}-{turno.fin} 🌙")
        else:
            st.info("No hay turnos nocturnos")

def _es_turno_nocturno(turno) -> bool:
    """
    Verifica si un turno incluye horas nocturnas (21:00-06:00)
    """
    try:
        from datetime import datetime
        inicio = datetime.strptime(turno.inicio, "%H:%M")
        fin = datetime.strptime(turno.fin, "%H:%M")
        
        # Si es después de las 21:00 o antes de las 06:00
        return inicio.hour >= 21 or fin.hour >= 21 or fin.hour < 6
    except:
        return False

def render_atajos_teclado():
    """
    Muestra información sobre atajos de teclado disponibles
    """
    st.markdown("""
    <div style="
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        margin-top: 16px;
    ">
        <div style="color: white; font-size: 0.875rem; margin-bottom: 8px;">
            <strong>⌨️ Atajos de teclado:</strong>
        </div>
        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; line-height: 1.4;">
            • <kbd>Enter</kbd> para agregar turno<br>
            • <kbd>Esc</kbd> para limpiar input<br>
            • <kbd>↑↓</kbd> para navegar sugerencias
        </div>
    </div>
    """, unsafe_allow_html=True)
