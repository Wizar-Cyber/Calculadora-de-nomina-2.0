# 📋 Guía de Uso - Calculadora de Nómina de Conductores TA

## 📌 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Cómo Usar](#cómo-usar)
5. [Funcionalidades](#funcionalidades)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

La **Calculadora de Nómina de Conductores TA** es una herramienta digital que permite:
- 📊 Calcular la nómina quincenal de conductores
- ⏰ Agregar turnos, horas extras, y eventos especiales
- 💰 Visualizar desglose detallado de devengados y deducciones
- 📱 Acceder desde cualquier dispositivo (móvil, tablet, desktop)

---

## ✅ Requisitos

### Software necesario:
- **Node.js 16+** (para ejecutar el frontend)
- **Python 3.8+** (para ejecutar el backend)
- **Navegador web moderno** (Chrome, Firefox, Edge, Safari)

### Verificar instalación:
```bash
# Verificar Node.js
node --version

# Verificar Python
python --version
```

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Wizar-Cyber/Calculadora-de-nomina-2.0.git
cd Calculadora-de-nomina-2.0
```

### 2. Instalar dependencias del Backend

```bash
# Entrar a la carpeta backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

**Archivo `requirements.txt` debe contener:**
```
fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.4.0
python-multipart==0.0.6
```

### 3. Instalar dependencias del Frontend

```bash
# Volver a la raíz y entrar a frontend
cd ../frontend

# Instalar dependencias
npm install
```

### 4. Verificar que `turnos.json` existe

El archivo `backend/data/turnos.json` debe tener la estructura de turnos disponibles:
```json
[
  {
    "codigo": "001",
    "nombre": "Turno Mañana",
    "hora_inicio": "06:00",
    "hora_fin": "14:00",
    ...
  }
]
```

---

## 🎮 Cómo Usar

### Paso 1: Iniciar el Backend

```bash
cd backend
python main.py
```

Deberías ver algo como:
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

#### ⚠️ Si el puerto 8000 está ocupado:
```bash
# Buscar qué proceso usa el puerto
# En Windows:
netstat -ano | findstr :8000

# En Mac/Linux:
lsof -i :8000
```

---

### Paso 2: Iniciar el Frontend

En otra terminal:
```bash
cd frontend
npm run dev
```

Deberías ver algo como:
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

---

### Paso 3: Acceder a la aplicación

Abre tu navegador y ve a: **http://localhost:3000**

---

## 🛠️ Funcionalidades

### 1️⃣ Seleccionar Quincena

En la esquina superior izquierda:
- Elige entre quincena **1-15** o **16-30**
- Esto determina los días trabajados disponibles

### 2️⃣ Agregar Turnos

**Botón:** "Agregar Turno"

1. Abre el formulario
2. Selecciona la **fecha del turno**
3. Selecciona el **código del turno** disponible
4. Haz clic en **Agregar**

**Ejemplo:**
- Fecha: 29 de enero 2026
- Turno: 001 (Mañana - 06:00 a 14:00)

### 3️⃣ Agregar Horas Extras

**Botón:** "Agregar Extra"

1. **Minutos:** Cantidad de minutos trabajados extra
   - 60 minutos = 1 hora
   - 480 minutos = 8 horas

2. **Tipo de recargo:**
   - 📌 **25%** - Extra diurna (normal)
   - 📌 **75%** - Extra nocturna (después de las 22:00)
   - 📌 **100%** - Extra festiva

3. Sistema automáticamente calcula el valor

**Ejemplo:**
- Minutos: 120 (2 horas)
- Recargo: 25%
- Resultado: Se suma a "Devengados"

### 4️⃣ Agregar Deducciones Manuales

**Botón:** "Agregar Extra" → Pestaña "Deducciones"

1. **Nombre:** Qué se deduce (ej: "Atraso", "Multa", etc.)
2. **Valor:** Monto a descontar
3. Haz clic en **Agregar**

**Ejemplo:**
- Nombre: "Combustible"
- Valor: $50,000
- Resultado: Se resta del neto a pagar

### 5️⃣ Agregar Eventos Especiales

**Botones:** CP, Licencia, Suspensión, Incapacidad, DISPO

#### **CP (Compensatorio)**
- Agrega un día compensatorio
- Se calcula como día trabajado al 100%
- Botón: **CP**

#### **Licencia**
- Día de licencia no remunerada
- No genera devengado
- Botón: **Licencia**

#### **Suspensión**
- Día de suspensión (sin pago)
- No genera devengado
- Botón: **Suspensión**

#### **Incapacidad**
- Día de incapacidad
- Se paga al 66.67%
- Botón: **Incapacidad**

#### **DISPO (Disponibilidad)**
- Tiempo de disponibilidad entre turnos
- Horario de inicio y fin
- Opción: Marcar si es **festivo** (se paga diferente)
- Botón: **Disponibilidad**

### 6️⃣ Visualizar Resultados

La pantalla muestra automáticamente:

**Sección Superior - Neto a Pagar:**
- Monto total a pagar (en azul)
- Devengado total vs Deducciones (gráfico)

**Tarjeta de Devengados (Verde):**
- Desglose de todos los conceptos que se pagan
- Salario base, extras, civicas, auxilio, etc.

**Tarjeta de Deducciones (Rojo):**
- Desglose de todas las deducciones
- EPS, pensión, SURA, deducciones manuales, etc.

**Colilla de Pago:**
- Vista formateada de la nómina
- Lista todos los conceptos
- Botón para imprimir

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Nómina Simple (Solo Turno)

**Objetivo:** Calcular nómina para un turno normal

**Pasos:**
1. ✅ Selecciona quincena: **30**
2. ✅ Agrega turno: **001** (06:00-14:00) el **29 enero 2026**
3. ✅ Observa resultados automáticos

**Resultado esperado:**
- Salario diario se calcula automáticamente
- Devengados: Salario + Auxilio + Cívicas
- Deducciones: EPS + Pensión + SURA
- Neto: Devengado - Deducciones

---

### Ejemplo 2: Nómina con Extras

**Objetivo:** Calcular nómina con horas extras

**Pasos:**
1. ✅ Selecciona quincena: **30**
2. ✅ Agrega turno: **001** el **29 enero 2026**
3. ✅ Agrega extra:
   - Minutos: **120**
   - Recargo: **25%**
4. ✅ Observa cómo aumenta "Totales de Devengados"

**Resultado esperado:**
- En "Horas extras" aparece: "Extra Diurna 25%: $xxxxx"
- El neto a pagar aumenta
- La barra de devengados se desplaza hacia la derecha

---

### Ejemplo 3: Nómina con Evento (CP)

**Objetivo:** Agregar un día compensatorio

**Pasos:**
1. ✅ Selecciona quincena: **30**
2. ✅ Agrega turno: **001** el **29 enero 2026**
3. ✅ Haz clic en botón **CP**
4. ✅ Sistema agrega "Compensatorio" automáticamente

**Resultado esperado:**
- En Devengados aparece: "Compensatorio: $xxxxx"
- Se suma al neto a pagar
- Sistema mantiene todos los demás valores

---

### Ejemplo 4: Nómina Completa (Combinada)

**Objetivo:** Nómina realista con múltiples elementos

**Pasos:**
1. ✅ Selecciona quincena: **30**
2. ✅ Agrega 2 turnos: **001** y **002**
3. ✅ Agrega extra: **120 minutos** con **25%**
4. ✅ Agrega deducción: "Combustible" = $50,000
5. ✅ Agrega evento: CP (botón CP)
6. ✅ Agrega DISPO: 6 horas, festivo marcado

**Resultado esperado:**
- Todos los conceptos se suman/restan correctamente
- Nada desaparece al agregar nuevos elementos
- Desglose muestra todos los conceptos
- Neto final = Devengado total - Deducciones total

---

### Ejemplo 5: Cambiar Quincena

**Objetivo:** Alternar entre quincena 1-15 y 16-30

**Pasos:**
1. ✅ Observa valores con quincena **30**
2. ✅ Cambia a quincena **1** (arriba a la izquierda)
3. ✅ Valores se recalculan automáticamente (menos días)
4. ✅ Puedes cambiar ANTES o DESPUÉS de agregar turnos

**Importante:** Cambiar quincena actualiza los turnos disponibles y recalcula el salario diario.

---

## 🔄 Workflow Típico

```
1. Abro la aplicación (http://localhost:3000)
                    ↓
2. Selecciono quincena (30)
                    ↓
3. Agrego turnos del empleado
                    ↓
4. Agrego horas extras (si aplica)
                    ↓
5. Agrego deducciones manuales (si aplica)
                    ↓
6. Agrego eventos especiales (CP, Licencia, etc.)
                    ↓
7. Reviso el resumen de devengados y deducciones
                    ↓
8. Reviso la colilla de pago
                    ↓
9. Imprimo o guardo (Print: Ctrl+P)
```

---

## 📊 Interpretación de Resultados

### Neto a Pagar
- Es el monto final que recibe el empleado
- **Fórmula:** (Salario + Auxilio + Cívicas + Extras) - (EPS + Pensión + SURA + Deducciones Manuales)

### Devengado
- Todo lo que se PAGA al empleado
- Incluye: Salario, extras, civicas, auxilio, etc.
- **Color:** Verde ✅

### Deducciones
- Todo lo que se DESCUENTA del empleado
- Incluye: EPS, pensión, SURA, deducciones manuales
- **Color:** Rojo ⚠️

### Gráfica de Barras
- Muestra proporción entre Devengado y Deducciones
- Verde = Cantidad que recibe
- Rojo = Cantidad que se descuenta

---

## 🐛 Troubleshooting

### ❌ "No puedo conectar al backend"

**Solución:**
```bash
# Verifica que el backend está corriendo
# Terminal debe mostrar: "Uvicorn running on http://0.0.0.0:8000"

# Si no está corriendo:
cd backend
python main.py

# Si dice que el puerto está ocupado:
# Cambia el puerto en backend/main.py
# Última línea: uvicorn.run(app, host="0.0.0.0", port=8001)
```

### ❌ "Los turnos no cargan"

**Solución:**
1. Verifica que el archivo existe: `backend/data/turnos.json`
2. Verifica que el JSON está bien formateado (sin errores de sintaxis)
3. Reinicia el backend:
   ```bash
   # Ctrl+C para detener
   cd backend
   python main.py
   ```

### ❌ "Al agregar un evento desaparecen mis extras"

**Esta es un BUG que ya fue SOLUCIONADO.**
- Todos los métodos ahora usan `calculatePayroll()`
- Nada debería desaparecer

Si aún ocurre:
1. Recarga la página: `Ctrl+R` o `F5`
2. Limpia el caché: `Ctrl+Shift+Delete`
3. Si persiste, reinicia ambos servidores

### ❌ "Los números salen mal en móvil"

**Solución:**
- La app es responsive
- Si algo se ve mal, recarga: `Ctrl+R`
- Prueba cambiar la orientación (vertical/horizontal)

### ❌ "No puedo imprimir"

**Solución:**
```
1. Haz clic en "Colilla de Pago"
2. Presiona: Ctrl+P (Windows/Linux) o Cmd+P (Mac)
3. Selecciona "Guardar como PDF"
4. Elige ubicación y nombre
```

### ❌ "La aplicación está lenta"

**Solución:**
1. Cierra otras aplicaciones
2. Reinicia el navegador
3. Limpia el caché del navegador
4. Si persiste, reinicia:
   ```bash
   # Backend: Ctrl+C y luego python main.py
   # Frontend: Ctrl+C y luego npm run dev
   ```

---

## 📞 Soporte

Si hay problemas:

1. **Verifica que ambos servidores estén corriendo:**
   - Backend: `http://0.0.0.0:8000`
   - Frontend: `http://localhost:3000`

2. **Abre la consola del navegador (F12):**
   - Tab "Console" y "Network"
   - Busca mensajes de error

3. **Revisa los logs del backend:**
   - Debería mostrar cada request

4. **Intenta limpiar datos:**
   - Abre DevTools (F12)
   - Aplicación → Storage → Clear all
   - Recarga la página

---

## 📚 Información Técnica

### Tecnologías Usadas

| Componente | Tecnología |
|-----------|-----------|
| **Frontend** | Next.js 14 + React + TypeScript |
| **Backend** | FastAPI + Python |
| **Estilos** | Tailwind CSS |
| **Estado** | Zustand |

### Endpoints Principales

```
GET  /api/turnos                    → Cargar turnos disponibles
POST /api/calcular                  → Calcular nómina básica
POST /api/calcular-con-eventos      → Calcular nómina con eventos
```

### Estructura de Archivos

```
📁 Calculadora-de-nomina-2.0/
├── 📁 backend/
│   ├── main.py              (Endpoints)
│   ├── services/
│   │   └── calculadora.py   (Lógica de cálculo)
│   ├── models/
│   │   └── turno.py         (Modelos de datos)
│   └── data/
│       └── turnos.json      (Base de datos de turnos)
├── 📁 frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/      (Componentes React)
│   │   ├── store/           (Zustand store)
│   │   └── lib/
│   │       ├── api.ts       (Llamadas a API)
│   │       └── types.ts     (TypeScript types)
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ✨ Tips Profesionales

### 💡 Consejo 1: Usar Atajos
- **Ctrl+R:** Recargar página
- **Ctrl+P:** Imprimir colilla
- **F12:** Abrir DevTools (para debugging)

### 💡 Consejo 2: Validar Datos
Antes de entregar una nómina:
1. ✅ Verifica número de turnos vs días trabajados
2. ✅ Revisa si hay deducciones manuales sorpresa
3. ✅ Compara con nóminas anteriores
4. ✅ Guarda/imprime la colilla como respaldo

### 💡 Consejo 3: Backup de Datos
El sistema almacena datos en el navegador. Para no perderlos:
1. Toma screenshot de la pantalla
2. Exporta como PDF (Ctrl+P)
3. Apunta los valores en papel

### 💡 Consejo 4: Multiples Nóminas
Para calcular varias nóminas seguidas:
1. Calcula la primera
2. Haz clic en **"Limpiar Todo"**
3. Comienza de nuevo para el siguiente empleado

---

## 🎓 Preguntas Frecuentes

**P: ¿Cómo agrego múltiples turnos?**
A: Usa el botón "Agregar Turno" varias veces. Cada uno se suma al total.

**P: ¿Puedo cambiar quincena después de agregar turnos?**
A: Sí, el sistema recalcula automáticamente los valores.

**P: ¿Qué pasa si agrego un evento erróneamente?**
A: Los eventos tienen un ícono "X" para eliminarlos. Haz clic y se recalcula.

**P: ¿Se guardan los datos automáticamente?**
A: Sí, en la memoria del navegador. Si cierras la pestaña se pierden.

**P: ¿Puedo usar esto desde mi teléfono?**
A: Sí, es responsive. Accede a `http://[IP-DEL-SERVIDOR]:3000`

**P: ¿Cómo imprimo la colilla de pago?**
A: Abre la colilla y presiona Ctrl+P. Elige "Guardar como PDF".

---

## 📝 Versión del Documento

- **Versión:** 1.0
- **Fecha:** 29 de enero de 2026
- **Autor:** Equipo de Desarrollo
- **Estado:** ✅ Completo y probado

---

¡Espero que esta guía te sea útil! Si tienes preguntas, no dudes en contactar al equipo de soporte. 🚀
