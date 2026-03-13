# 📊 Calculadora de Nómina - Conductores TA

Sistema web moderno y completo para cálculo de nómina de conductores. 
Desarrollado con **Next.js 16** (TypeScript) + **Tailwind CSS**.

> **v2.0**: Backend y frontend integrados en una única aplicación Next.js. Deploy en Netlify sin latencias.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
cd frontend && npm install

# 2. Ejecutar servidor de desarrollo
npm run dev

# 3. Abrir en navegador
# http://localhost:3000
```

---

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── page.tsx            # Página principal
│   │   ├── layout.tsx          # Layout global
│   │   └── api/                # API Endpoints (Next.js)
│   │       ├── turnos/         # GET lista de turnos
│   │       ├── calcular/       # POST cálculo básico
│   │       └── calcular-con-eventos/  # POST con eventos
│   │
│   ├── components/             # Componentes React
│   │   ├── forms/              # Formularios
│   │   ├── payroll/            # Visualización de nómina
│   │   ├── tables/             # Tablas de datos
│   │   ├── layout/             # Header, Footer, Nav
│   │   └── ui/                 # Componentes base
│   │
│   ├── lib/                    # Librerías y utilidades
│   │   ├── api.ts              # Cliente Axios
│   │   ├── calculadora.ts      # Motor de cálculo
│   │   ├── config.ts           # Constantes de negocio
│   │   ├── turno.ts            # Modelo Turno
│   │   ├── turnos-data.ts      # Catálogo de turnos
│   │   ├── types.ts            # Interfaces TypeScript
│   │   └── utils.ts            # Funciones utilitarias
│   │
│   └── store/                  # Estado global (Zustand)
│       └── usePayrollStore.ts
│
├── public/                     # Archivos estáticos
│   ├── turnos.json            # Backup de datos
│   └── test-api.js            # Script de prueba
│
├── .env.local                  # Variables de entorno
├── next.config.js              # Configuración Next.js
├── tailwind.config.ts          # Configuración Tailwind
└── package.json
```

---

## 💻 Características

✅ **Gestión de Turnos** - Seleccionar turnos por quincena  
✅ **Cálculo Automático** - Devengado, deducciones y neto  
✅ **Eventos Especiales** - Suspensiones, licencias, incapacidades, extras  
✅ **Desglose Detallado** - Visualizar cómo se calcula cada valor  
✅ **Interfaz Moderna** - Responsive design con Tailwind CSS  
✅ **Sin Latencias** - Deployment integrado (Netlify)

---

## 🔌 API Endpoints

Todos bajo `/api`:

### `GET /api/turnos`
Obtiene lista de turnos disponibles.

```bash
curl http://localhost:3000/api/turnos
```

### `POST /api/calcular`
Calcula nómina básica (solo turnos).

```bash
curl -X POST http://localhost:3000/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"quincena": "2024-01", "turnos": ["250M"]}'
```

### `POST /api/calcular-con-eventos`
Calcula nómina con eventos especiales.

```bash
curl -X POST http://localhost:3000/api/calcular-con-eventos \
  -H "Content-Type: application/json" \
  -d '{
    "quincena": "2024-01",
    "turnos": ["250M"],
    "eventos": [{"tipo": "extra", "minutos": 60, "recargo": 0.35}]
  }'
```

---

## 💰 Configuración de Negocio

### Salario
- **Mensual**: $2,347,526
- **Quincena**: $1,173,763
- **Hora**: $13,041.81

### Franja Horaria
| Franja | Horario | Recargo |
|--------|---------|---------|
| Diurna | 6:00-19:00 | 0% |
| Nocturna | 19:00-6:00 | +35% |
| Dom. Diurna | 6:00-19:00 | +80% |
| Dom. Nocturna | 19:00-6:00 | +210% |

### Deducciones
- **Salud**: 4% del devengado
- **Pensión**: 4% del devengado

### Beneficios
- **Cívicas**: 24 pasajes × $3,820 = $91,680/quincena
- **Auxilio**: Proporcional a días laborados

---

## 🔧 Archivos Clave

### **`src/lib/calculadora.ts`** (300+ líneas)
Motor de cálculo con métodos para:
- Calcular horas por franja (diurna/nocturna)
- Aplicar recargos según tipo de día
- Procesar eventos especiales
- Calcular deducciones y beneficios

### **`src/lib/config.ts`**
Todas las constantes de negocio en un lugar centralizado.

### **`src/lib/turnos-data.ts`**
Catálogo de 176 turnos en formato TypeScript para rápido acceso.

### **`src/app/api/calcular/route.ts`**
Endpoint que recibe turnos y retorna nómina completa.

---

## 📦 Deploy en Netlify

Ver [DEPLOY.md](DEPLOY.md)

**Resumen:**
1. Push a GitHub
2. Conectar en Netlify
3. Configurar `NEXT_PUBLIC_API_BASE_URL=/api` (ya viene por defecto)
4. Netlify detecta automáticamente Next.js y deploya

---

## 📚 Documentación Adicional

- **[DEPLOY.md](DEPLOY.md)** - Guía detallada de deployment
- **[GUIA_USO.md](GUIA_USO.md)** - Manual de usuario (en construcción)

---

## 🛠️ Stack Tecnológico

**Frontend:**
- Next.js 16.1.6 (React 19)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)

**Backend:**
- Next.js API Routes
- TypeScript (lógica migrada de Python)

**Deployment:**
- Netlify (recomendado)

---

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor con hot-reload
npm run build    # Compilar para producción  
npm run start    # Ejecutar versión producción
npm run lint     # Verificar código
```

---

## 🔄 Cambios Principales (v2.0)

- ✅ Backend Python migrado a TypeScript
- ✅ API integrada en Next.js API Routes
- ✅ Sin servidor separado = sin latencias
- ✅ Deploy único en Netlify
- ✅ Mejor rendimiento y mantenibilidad

---

**Última actualización:** 24 de febrero de 2026  
**Versión:** 2.0 (Integrada en Next.js)
