# Calculadora de Nómina - Conductores TA

Sistema web moderno para cálculo de nómina de conductores con Front-end en Next.js/React y Back-end en FastAPI.

## 🏗️ Estructura del Proyecto

```
.
├── backend/                    # API FastAPI (Python)
│   ├── main.py                # Servidor principal
│   ├── config.py              # Configuración y constantes
│   ├── requirements.txt        # Dependencias Python
│   ├── models/                # Modelos de datos
│   │   └── turno.py           # Modelo Turno
│   ├── services/              # Lógica de cálculo
│   │   └── calculadora.py     # Motor de cálculos
│   └── data/turnos.json       # Catálogo de turnos
│
├── frontend/                   # Aplicación Next.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── src/
│   │   ├── app/               # Páginas (App Router)
│   │   ├── components/        # Componentes React
│   │   ├── lib/               # Utilidades y API
│   │   └── store/             # Estado (Zustand)
│   └── public/
│
├── turnos.json                # Catálogo de turnos
└── README.md                  # Este archivo
```

## 🚀 Inicio Rápido

### Backend (API FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

API disponible en: `http://localhost:8001`  
Documentación: `http://localhost:8001/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App disponible en: `http://localhost:3000`

## 💰 Configuración de Cálculo

### Salario Base
- **Mensual**: $2,233,612 COP
- **Quincena**: $1,116,806 COP
- **Día**: $74,454 COP
- **Hora**: $12,409 COP

### Recargos
- **Nocturno (21:00-06:00)**: +35%
- **Festivo Diurno (06:00-21:00)**: +80%
- **Festivo Nocturno (21:00-06:00)**: +210%

### Deducciones
- **Salud**: 4% del devengado
- **Pensión**: 4% del devengado

### Eventos Especiales

| Evento | Pago | Cívicas | Auxilio |
|--------|------|---------|---------|
| **Suspensión** | 0% | -2 | -$6,667 |
| **Licencia** | 0% | Completo | -$6,667 |
| **Incapacidad** | 66.67% | Completo | Completo |
| **CP** | +1 día | -1 | Completo |

## 🔗 Endpoints Principales

### Turnos
- `GET /api/turnos` - Todos los turnos
- `GET /api/turnos/{codigo}` - Turno específico

### Cálculos
- `POST /api/calcular` - Cálculo con turnos
- `POST /api/calcular-con-eventos` - Cálculo con turnos + eventos

### Eventos
- `POST /api/eventos/suspension` - Agrega suspensión
- `POST /api/eventos/licencia` - Agrega licencia
- `POST /api/eventos/incapacidad` - Agrega incapacidad
- `POST /api/eventos/cp` - Agrega compensatorio
- `POST /api/eventos/extra` - Agrega horas extras
- `POST /api/eventos/deduccion` - Agrega deducción manual

## 🛠️ Tecnologías

### Backend
- FastAPI
- Python 3.9+
- Pydantic (validación)

### Frontend
- Next.js 13+
- React 18+
- TypeScript
- Zustand (estado)
- Tailwind CSS
- Axios (HTTP)

## 📋 Flujo Principal

1. Usuario selecciona quincena
2. Agrega turnos y/o eventos
3. Sistema calcula automáticamente:
   - Devengados (base + recargos)
   - Deducciones (salud + pensión)
   - Cívicas y auxilio
   - Neto a pagar
4. Muestra colilla de pago detallada

## 🔄 Sincronización

- ✅ Agregar turno → se recalcula con eventos existentes
- ✅ Agregar evento → se recalcula con turnos existentes
- ✅ Eliminar turno → se mantienen los eventos
- ✅ Eliminar evento → se mantienen los turnos

## 📧 Configuración de API

En [frontend/src/lib/api.ts](frontend/src/lib/api.ts):

```typescript
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
```

## 👤 Autor

Reiber
