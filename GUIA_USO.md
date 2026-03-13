# 📖 Guía de Uso - Calculadora de Nómina

Manual completo para usar la Calculadora de Nómina de Conductores TA.

---

## 🎯 Pantalla Principal

Al abrir la app (`http://localhost:3000`), verásuna interfaz clara con:

1. **Selector de Quincena** - Primera o segunda mitad del mes
2. **Tabla de Turnos** - Lista de turnos disponibles
3. **Panal de Cálculo** - Desglose de devengado, deducciones, neto
4. **Botones de Acción** - Calcular, limpiar, agregar eventos

---

## 📝 Flujo de Uso

### Paso 1: Seleccionar Quincena

En la parte superior, selecciona:
- **2024-01** (Primera quincena del mes)
- **2024-02** (Segunda quincena del mes)

> La quincena solo afecta a dias_trabajados. Los turnos se procesan igual.

### Paso 2: Elegir Turnos

En la tabla de turnos:
1. Busca los turnos trabajados (**código**, **descripción**, **horario**)
2. Haz click en el turno para seleccionarlo
   - ✅ Turno seleccionado (se marca)
   - ❌ Turno no seleccionado (sin marcar)

**Columnas de la tabla:**
- **Código**: Identificador (ej: "250M")
- **Descripción**: Nombre del turno
- **Hora Inicio**: Cuando comienza
- **Hora Fin**: Cuando termina
- **Festivo**: Si es día de descanso remunerado

### Paso 3: Calcular Nómina Básica

Una vez seleccionados los turnos:
1. Haz click en botón **"Calcular"**
2. El sistema calcula automáticamente:
   - Devengado (salario + recargos)
   - Deducciones (salud + pensión)
   - Neto a pagar
   - Cívicas y auxilio

**Resultado mostrado:**
```
DEVENGADO:          $1,186,696
+ CÍVICAS:          $91,680
- DEDUCCIONES:      $94,935
─────────────────────────────
NETO A PAGAR:       $1,183,440
```

### Paso 4 (Opcional): Agregar Eventos Especiales

Si hay suspensiones, licencias, horas extras, etc.:

1. Click en **"Agregar Evento"**
2. Selecciona tipo de evento:
   - **Suspensión** - Día sin pago (-2 cívicas)
   - **Licencia** - Día remunerado (100%)
   - **Incapacidad** - Día parcial (66.67%)
   - **CP** - Capacitación/Día compensatorio
   - **Extra** - Horas adicionales con recargo
   - **Deducción** - Descuento manual

3. Completa los detalles según el tipo
4. Click en **"Aplicar Evento"**
5. El cálculo se actualiza automáticamente

---

## 🔍 Entender el Desglose

### Devengados (Lo que se GANA)

```
SALARIO BÁSICO          $1,173,763  (15 días de quincena)
+ RECARGO ORDINARIO NOC $12,933     (Horas nocturnas +35%)
+ RECARGO DOMINICAL     $0          (Si aplica, +80% o +210%)
─────────────────────────────────
TOTAL DEVENGADO         $1,186,696
```

> El recargo se calcula automáticamente según:
> - Horario del turno (6-19 diurno, 19-6 nocturno)
> - Si es festivo o no

### Cívicas (Pasajes)

```
24 pasajes × $3,820 = $91,680
```

> Se descuentan -2 pasajes por cada día de suspensión

### Auxilio de Transporte

```
$249,095 (Mensual)
Proporcional a días laborados
```

> Si trabaja menos de 15 días, se reduce proporcionalmente

### Deducciones (Lo que se QUITA)

```
SALUD       $47,467 (4% del devengado)
PENSIÓN    $47,467 (4% del devengado)
────────────────────
TOTAL      $94,935
```

### Neto a Pagar

```
DEVENGADO            $1,186,696
+ CÍVICAS            $91,680
- DEDUCCIONES        $94,935
────────────────────────────════
NETO A PAGAR         $1,183,440
```

---

## ⚙️ Tipos de Eventos Especiales

### Suspensión

- **Pago**: 0% (no se paga)
- **Cívicas**: -2 pasajes
- **Auxilio**: Se descuenta proporcional
- **Entrada**: Solo cantidad de días

```
Suspensión: 2 días → Descuenta $0 + 2×(-2 cívicas) + proporcional auxilio
```

### Licencia

- **Pago**: 100% (se paga completo)
- **Cívicas**: Sigue igual
- **Auxilio**: Normal
- **Entrada**: Solo cantidad de días

```
Licencia: 1 día → Se paga un día completo
```

### Incapacidad

- **Pago**: 66.67% (dos terceras partes)
- **Cívicas**: Sigue igual
- **Auxilio**: Normal
- **Entrada**: Cantidad de días

```
Incapacidad: 3 días → Se paga 3 × 66.67% del día
```

### Capacitación (CP)

- **Pago**: 100% (se paga completo)
- **Cívicas**: Completo
- **Auxilio**: Completo

### Disposición (Dispo)

- **Pago**: Por la hora exacta
- Necesita: Hora inicio, hora fin, si es festivo

### Horas Extra

- **Pago**: Por minuto trabajado + recargo especial
- Necesita: Cantidad de minutos, porcentaje de recargo
- Ejemplo: 60 minutos + 35% recargo = $13,041 + 35%

### Deducción Manual

- **Descuento**: Resta el valor indicado
- Útil para: Descuentos por daños, prestamos, etc.

---

## 🧮 Fórmulas de Cálculo

### Valor Hora Base

```
$13,041.81 = ($2,347,526 mensual) / (30 días) / (6 horas/día)
```

### Horas por Franja

```
El sistema automáticamente divide:
- Horas DIURNAS (6:00-19:00) → $13,041.81/hora
- Horas NOCTURNAS (19:00-6:00) → $13,041.81 × 1.35 = $17,606.44/hora
- Dominical DIURNO → $13,041.81 × 1.80 = $23,475.26/hora
- Dominical NOCTURNO → $13,041.81 × 3.10 = $40,429.61/hora
```

### Cívicas Proporcional

```
Si trabaja <15 días:
  Cívicas = 24 pasajes × ($3,820) × (días_trabajados / 15)
```

---

## 💡 Tips y Trucos

1. **Verificar totales**: Los números se actualizan en tiempo real
2. **Limpiar todo**: Click en **"Limpiar"** para empezar de novo
3. **Ver detalles**: Haz scroll en el panel de resultado para ver desglose completo
4. **Exportar** (futuro): Próximamente habrá botón para descargar PDF

---

## ⚠️ Casos Especiales

### Turno que cruza medianoche

```
Ejemplo: 21:00 - 06:00 (9 horas)
Sistema automáticamente divide:
- 21:00 - 00:00 (3 horas nocturnas)
- 00:00 - 06:00 (6 horas nocturnas)
Total: 9 horas nocturnas (todas con +35%)
```

### Día festivo con turno

Si el turno es marcado como festivo:
```
Todos sus recargos se multiplican:
- Ordinario (6-19) → +80%
- Nocturno (19-6) → +210%
```

### Quincena incompleta

Si solo trabaja 10 días en lugar de 15:
```
- Salario: $1,173,763 × (10/15) = $782,508
- Cívicas: $91,680 × (10/15) = $61,120
- Auxilio: $249,095 × (10/15) = $166,063
```

---

## 🔧 Troubleshooting

**P: ¿Por qué el total no cuadra?**  
R: Verifica que hayas hecho click en **"Calcular"** después de seleccionar turnos.

**P: ¿Se puede editar un turno?**  
R: No, pero puedes agregar eventos para ajustar el cálculo.

**P: ¿Se guardan los datos?**  
R: Temporalmente en la sesión del navegador. Para guardar, export a PDF (futuro feature).

**P: ¿Qué pasa si selecciono un turno dos veces?**  
R: Solo se cuenta una vez. El sistema detecta duplicados.

---

## 📱 Pantalla Móvil

- Soportado en teléfono/tablet
- Interfaz responsive
- Haz scroll para ver toda la información

---

**Última actualización:** 24 de febrero de 2026
