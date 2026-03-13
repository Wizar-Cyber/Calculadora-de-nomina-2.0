# 🏛️ Arquitectura del Proyecto

Documentación técnica de la estructura y arquitectura de la Calculadora de Nómina.

---

## 📋 Estructura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)             │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Componentes UI (PayrollSlip, ShiftTable, etc.)   │ │
│  └────────────────────────────────────────────────────┘ │
│               ↓ (usa)                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Zustand Store (usePayrollStore.ts)               │ │
│  │  - Gestiona estado global de nómina               │ │
│  │  - Acciones: calcular, limpiar, agregar eventos  │ │
│  └────────────────────────────────────────────────────┘ │
│               ↓ (llama)                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Cliente API (src/lib/api.ts)                     │ │
│  │  - fetchTurnos() → GET /api/turnos                │ │
│  │  - calcularNomina() → POST /api/calcular          │ │
│  │  - calcularNominaConEventos() → POST con eventos  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓ (HTTP)
┌─────────────────────────────────────────────────────────┐
│              Backend API (Next.js Routes)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  POST /api/calcular                               │ │
│  │  POST /api/calcular-con-eventos                   │ │
│  │  GET /api/turnos                                  │ │
│  └────────────────────────────────────────────────────┘ │
│              ↓ (usa)                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Motor de Cálculo (src/lib/calculadora.ts)        │ │
│  │  - Clase CalculadoraNomina                        │ │
│  │  - Métodos para cada tipo de evento               │ │
│  │  - Cálculo de franja horaria                       │ │
│  └────────────────────────────────────────────────────┘ │
│              ↓ (usa)                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Configuración y Datos                            │ │
│  │  - src/lib/config.ts (constantes)                 │ │
│  │  - src/lib/turnos-data.ts (catálogo de turnos)   │ │
│  │  - src/lib/types.ts (interfaces)                  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Descripción de Archivos Clave

### Frontend - Presentación

#### `src/app/page.tsx`
**Responsabilidad:** Página principal de la aplicación

```typescript
// Render de componentes principales:
// - Header
// - QuincenaSelect (selector de quincena)
// - ShiftTable (tabla de turnos)
// - PayrollSlip (mostrar resultado)
// - Botones de acción
```

#### `src/components/payroll/PayrollSlip.tsx`
**Responsabilidad:** Mostrar desglose de nómina calculada

```typescript
// Output:
// - Devengado con desglose
// - Deducciones (salud, pensión)
// - Cívicas y auxilio
// - Neto total
```

#### `src/components/tables/ShiftTable.tsx`
**Responsabilidad:** Listar y permitir selección de turnos

```typescript
// Features:
// - Búsqueda/filtrado
// - Selección múltiple
// - Mostrar detalle de cada turno
```

### Frontend - Estado

#### `src/store/usePayrollStore.ts`
**Responsabilidad:** Gestionar estado global con Zustand

```typescript
// Estado:
// - quincena: string
// - turnosSeleccionados: string[]
// - resultado: PayrollResponse | null
// - eventos: EventoData[]

// Acciones:
// - setQuincena(q: string)
// - toggleTurno(codigo: string)
// - calcularNomina()
// - agregarEvento(evento: EventoData)
// - limpiar()
```

### Frontend - API

#### `src/lib/api.ts`
**Responsabilidad:** Cliente HTTP para comunicación con backend

```typescript
// Funciones:
export async function fetchTurnos(): Promise<Turno[]>
export async function calcularNomina(quincena: string, turnos: string[]): Promise<PayrollResponse>
export async function calcularNominaConEventos(quincena: string, turnos: string[], eventos: Evento[]): Promise<PayrollResponse>
```

### Lógica - Motor de Cálculo

#### `src/lib/calculadora.ts` (300+ líneas)
**Responsabilidad:** Toda la lógica matemática de cálculo

```typescript
class CalculadoraNomina {
  // Estado
  devengado: number
  deducciones_manuales: Array<[string, number]>
  diasisincapacidad: number
  // ... más propiedades

  // Métodos principales
  agregarTurno(turno: Turno): void
  calcularHorasPorFranja(turno: Turno): [number, number]
  calcularRecargo(horas_franja: number, tipo_recargo: string): number
  
  // Eventos
  agregarSuspension(cantidad: number): void
  agregarLicencia(cantidad: number): void
  agregarIncapacidad(cantidad: number): void
  agregarExtra(minutos: number, recargo: number): void
  agregarDeduccion(nombre: string, valor: number): void
  
  // Resultado
  getResultado(turnos_count: number): PayrollResult
}
```

**Algoritmo de cálculo de recargos:**

```
1. Obtener hora inicio/fin del turno
2. Si fin < inicio → agregar 24h (cruza medianoche)
3. Dividir horas por franja horaria (6-19 diurna, 19-6 nocturna)
4. Si es festivo → aplicar recargo diferente
5. Sumar: horas × valor_hora × (1 + recargo)
```

#### `src/lib/config.ts`
**Responsabilidad:** Todas las constantes de negocio

```typescript
// Salario y hora
export const SALARIO_BASICO_MENSUAL = 2,347,526
export const VALOR_HORA = 13,041.81

// Recargos (porcentajes)
export const RECARGO_ORDINARIO_NOCTURNO = 0.35      // +35%
export const RECARGO_DOMINICAL_DIURNO = 0.8        // +80%
export const RECARGO_DOMINICAL_NOCTURNO = 2.1      // +210%

// Franja horaria
export const FRANJA_DIURNA = [6, 19]              // 6:00-19:00
export const FRANJA_NOCTURNA = [19, 6]            // 19:00-6:00

/// Deducciones y beneficios
export const DEDUCCIONES_BASE = { Salud: 0.04, Pensión: 0.04 }
export const PASAJES_CIVICA_VALOR = 3,820
export const AUXILIO_TRANSPORTE = 249,095
```

#### `src/lib/turno.ts`
**Responsabilidad:** Modelo de un turno individual

```typescript
export class Turno {
  codigo: string              // "250M"
  descripcion: string         // "Turno 250M"
  inicio: string             // "03:10"
  fin: string                // "09:10"
  festivo: boolean           // false

  horaInicioObj(): Date       // Convierte "03:10" a Date
  horaFinObj(): Date          // Convierte "09:10" a Date
}
```

#### `src/lib/turnos-data.ts`
**Responsabilidad:** Catálogo de 176 turnos disponibles

```typescript
// Importable, sin necesidad de archivos
export default [
  { código: "250M", descripcion: "Turno 250M", ... },
  { código: "251M", descripcion: "Turno 251M", ... },
  // ... 174 turnos más
]
```

**¿Por qué aquí y no en JSON?**
- ✅ Más rápido: No necesita leer archivo
- ✅ TypeScript: Verificación de tipos en tiempo de desarrollo
- ✅ Escalable: Sin límite de tamaño
- ✅ Backup: public/turnos.json como fallback

#### `src/lib/types.ts`
**Responsabilidad:** Interfaces TypeScript compartidas

```typescript
interface Turno { ... }           // Estructura de un turno
interface PayrollResponse { ... }  // Respuesta de cálculo
interface Evento { ... }           // Eventos especiales
```

### Backend - API Routes

#### `src/app/api/turnos/route.ts`
**Responsabilidad:** GET - Retornar lista de turnos

```typescript
// GET /api/turnos
// Respuesta: { turnos: Turno[] }
// Implementación: Lee de turnos-data.ts
```

#### `src/app/api/calcular/route.ts`
**Responsabilidad:** POST - Calcular nómina básica

```typescript
// POST /api/calcular
// Body: { quincena: string, turnos: string[] }
// Respuesta: PayrollResult (devengado, neto, etc.)
// Implementación:
// 1. Validar entrada
// 2. Crear CalculadoraNomina
// 3. Añadir cada turno
// 4. Retornar resultado
```

#### `src/app/api/calcular-con-eventos/route.ts`
**Responsabilidad:** POST - Calcular nómina con eventos especiales

```typescript
// POST /api/calcular-con-eventos
// Body: { quincena, turnos, eventos }
// Respuesta: PayrollResult con impacto de eventos
// Implementación:
// 1. Igual a calcular pero:
// 2. También procesa cada evento
// 3. Retorna resultado final
```

### Configuración

#### `next.config.js`
**Responsabilidad:** Configuración del build de Next.js

```javascript
{
  reactStrictMode: true,           // Detectar bugs en desarrollo
  // NO usar output: 'export' porque desactiva API Routes
}
```

#### `tailwind.config.ts`
**Responsabilidad:** Configuración de estilos Tailwind CSS

```typescript
{
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { /* extender temas */ },
  plugins: [],
}
```

#### `.env.example` / `.env.local`
**Responsabilidad:** Variables de entorno

```
NEXT_PUBLIC_API_BASE_URL=/api

// /api = API Routes locales (desarrollo/producción)
// https://backend.com/api = Backend externo (si aplica)
```

---

## 🔄 Flujos de Datos

### Flujo 1: Cargar Turnos

```
Componente ShiftTable
    ↓ (useEffect)
Cliente API: fetchTurnos()
    ↓ (HTTP GET /api/turnos)
Route Handler: GET /api/turnos
    ↓ (import turnos-data.ts)
Respone JSON: { turnos: [...] }
    ↓ (parcial)
Componente renderiza tabla
```

### Flujo 2: Calcular Nómina

```
Usuario selecciona turnos + click "Calcular"
    ↓
Store: toggleTurno() + calcularNomina()
    ↓
Cliente API: calcularNomina(quincena, turnos[])
    ↓ (HTTP POST /api/calcular)
Route Handler: POST /api/calcular
    ↓
CalculadoraNomina:
  1. agregarTurno() para cada código
  2. calcularHorasPorFranja()
  3. calcularRecargo()
  4. totalCivicas(), totalAuxilio()
  5. getResultado()
    ↓
Response: PayrollResult
    ↓
Store: guardar resultado
    ↓
Componente PayrollSlip renderiza resultado
```

### Flujo 3: Agregar Evento

```
Usuario: "Agregar Suspensión 2 días"
    ↓
Store: agregarEvento()
    ↓
Dispara calcularNominaConEventos()
    ↓
Cliente API: calcularNominaConEventos(q, turnos, eventos)
    ↓ (HTTP POST /api/calcular-con-eventos)
Route Handler: POST /api/calcular-con-eventos
    ↓
CalculadoraNomina:
  1. agregarTurno() x N
  2. Para cada evento:
     - agregarSuspension() / agregarLicencia() / etc.
  3. Recalcula totales con eventos
  4. getResultado()
    ↓
Response: PayrollResult (incluyendo impacto de eventos)
    ↓
Componente actualiza UI con nuevos valores
```

---

## 🧮 Ejemplo: Cálculo Detallado

**Input:**
```json
{
  "quincena": "2024-01",
  "turnos": ["250M"],
  "eventos": []
}
```

**Procesamiento:**

```
1. CalculadoraNomina("2024-01")
   - devengado = 1,173,763 (salario quincena)

2. agregarTurno("250M"):
   - Turno 250M: 03:10 - 09:10 (6 horas)
   - Franja: todas diurnas (6-19)
   - Recargo: 0% (ordinario diurno)
   - Pago: 6h × $13,041.81 = $78,250.86
   - devengado += 78,250.86

3. Calcular deducciones:
   - Salud: 1,252,013.86 × 0.04 = 50,080.55
   - Pensión: 1,252,013.86 × 0.04 = 50,080.55

4. Calcular cívicas:
   - 24 pasajes × $3,820 = $91,680

5. Calcular auxilio:
   - $249,095 (completo, 15 días)

6. Neto:
   = devengado + cívicas - deducciones
   = 1,252,013.86 + 91,680 - 100,161.10
   = 1,243,532.76
```

**Output:**
```json
{
  "devengado": 1252013.86,
  "civicas": 91680,
  "deducciones": 100161.10,
  "neto": 1243532.76,
  "desglose_devengados": { "Turno 250M": 78250.86, ... },
  "desglose_deducciones": { "Salud": 50080.55, "Pensión": 50080.55 },
  "dias_trabajados": 15,
  "turnos_count": 1
}
```

---

## 🚀 Deployment

**Desarrollo:**
```bash
npm run dev
# Ejecuta servidor local con hot-reload
# API en /api automáticamente disponible
```

**Producción (Netlify):**
```bash
npm run build
# Compila y optimiza
# Next.js automáticamente configura API Routes
# Netlify sirve desde CDN global
```

---

## 🔐 Seguridad

✅ **No expone credenciales**
- Variables sensibles NO tienen prefijo `NEXT_PUBLIC_`

✅ **Validación en servidor**
- Todos los endpoints validan entrada
- Sin ejecución de código malicioso

✅ **HTTPS en producción**
- Netlify fuerza HTTPS automáticamente

✅ **CORS**
- API routes permiten solo origen del sitio

---

## 📊 Rendimiento

**Optimizaciones:**

✅ TypeScript imports > File I/O
- turnos-data.ts cargada directamente (no lectura de archivo)

✅ Cálculos en servidor
- No expone lógica de negocio al cliente

✅ API reuse
- Mismos endpoints para web/mobile/API terceros

✅ CDN global
- Netlify distribuye automáticamente

---

**Última actualización:** 24 de febrero de 2026
