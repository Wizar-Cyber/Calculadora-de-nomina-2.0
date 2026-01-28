# 🧮 Calculadora de Nómina TA

Aplicación web moderna para calcular la nómina de conductores de Transporte Automotor en Colombia, con soporte para turnos, recargos, deducciones y beneficios laborales.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

#### Backend (Python/Streamlit)
- **Streamlit 1.31.0** - Framework principal para la interfaz web
- **Pandas 2.1.0** - Manipulación de datos y cálculos
- **Python 3.10+** - Lenguaje de programación

#### Frontend (Next.js/React) - Arquitectura Moderna
- **Next.js 15.1.0** - Framework React con renderizado del lado del servidor
- **React 19.0.0** - Biblioteca de componentes de UI
- **TypeScript 5.7.2** - Tipado estático para mayor robustez
- **Tailwind CSS 4.0.0** - Framework de CSS para diseño moderno
- **Framer Motion 11.18.2** - Animaciones y transiciones fluidas
- **Zustand 5.0.1** - Manejo de estado global
- **React Hook Form 7.54.2** - Formularios con validación
- **Zod 3.23.8** - Validación de esquemas
- **Radix UI** - Componentes accesibles y personalizados
- **Lucide React 0.462.0** - Iconos modernos
- **Axios 1.7.9** - Cliente HTTP para comunicación API

#### API Backend (FastAPI)
- **FastAPI** - Framework API moderno y rápido
- **Pydantic** - Validación de datos y serialización
- **CORS Middleware** - Comunicación entre frontend y backend

## 📁 Estructura del Proyecto

```
Calculadora-de-nomina/
├── 📂 app.py                    # Aplicación principal Streamlit
├── 📂 config.py                 # Configuración de salarios y constantes
├── 📂 turnos.json              # Base de datos de códigos de turnos
├── 📂 requirements.txt         # Dependencias Python
│
├── 📂 backend/                 # API FastAPI
│   ├── 📄 main.py              # Servidor API principal
│   ├── 📄 config.py            # Configuración del backend
│   ├── 📄 requirements.txt     # Dependencias del backend
│   ├── 📂 services/            # Lógica de negocio
│   │   └── 📄 calculadora.py   # Motor de cálculos de nómina
│   ├── 📂 models/              # Modelos de datos
│   │   └── 📄 turno.py         # Definición de modelo Turno
│   └── 📂 data/                # Datos estáticos
│       └── 📄 turnos.json      # Códigos y horarios de turnos
│
├── 📂 frontend/                # Aplicación Next.js
│   ├── 📄 package.json         # Dependencias Node.js
│   ├── 📄 next.config.js       # Configuración Next.js
│   ├── 📂 src/                 # Código fuente
│   │   ├── 📂 app/             # App Router (Next.js 13+)
│   │   │   ├── 📄 page.tsx     # Página principal
│   │   │   └── 📄 layout.tsx   # Layout global
│   │   ├── 📂 components/       # Componentes React
│   │   │   ├── 📂 ui/          # Componentes UI base
│   │   │   │   ├── 📄 button.tsx
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 badge.tsx
│   │   │   │   ├── 📄 input.tsx
│   │   │   │   ├── 📄 select.tsx
│   │   │   │   ├── 📄 table.tsx
│   │   │   │   └── 📄 tabs.tsx
│   │   │   ├── 📂 layout/      # Componentes de layout
│   │   │   │   ├── 📄 Header.tsx
│   │   │   │   ├── 📄 Navigation.tsx
│   │   │   │   └── 📄 Footer.tsx
│   │   │   ├── 📂 forms/       # Formularios
│   │   │   │   ├── 📄 ShiftInput.tsx
│   │   │   │   ├── 📄 QuincenaSelect.tsx
│   │   │   │   ├── 📄 ActionButtons.tsx
│   │   │   │   ├── 📄 ExtrasModal.tsx
│   │   │   │   └── 📄 DispoModal.tsx
│   │   │   ├── 📂 tables/      # Tablas de datos
│   │   │   │   ├── 📄 ShiftTable.tsx
│   │   │   │   └── 📄 EmptyState.tsx
│   │   │   ├── 📂 payroll/     # Componentes de nómina
│   │   │   │   ├── 📄 PayrollSlip.tsx
│   │   │   │   ├── 📄 DevengadosCard.tsx
│   │   │   │   ├── 📄 DeduccionesCard.tsx
│   │   │   │   └── 📄 NetoCard.tsx
│   │   │   └── 📂 ui/          # Utilidades UI
│   │   │       └── 📄 ToastNotification.tsx
│   │   └── 📂 lib/             # Utilidades y configuración
│   │       └── 📄 utils.ts     # Funciones helper
│   ├── 📂 public/              # Assets estáticos
│   └── 📂 .next/               # Build de Next.js
│
├── 📂 components/              # Componentes Streamlit (legacy)
│   ├── 📄 __init__.py
│   ├── 📄 navigation.py        # Navegación por pestañas
│   ├── 📄 badge.py             # Componente de insignias
│   ├── 📄 money_display.py     # Formato de moneda
│   ├── 📄 smart_input.py       # Input inteligente con validación
│   └── 📄 shift_table.py       # Tabla de turnos
│
├── 📂 models/                  # Modelos de datos Python
│   ├── 📄 turno.py             # Modelo de Turno
│   └── 📄 evento.py            # Modelo de Eventos
│
├── 📂 services/                # Servicios Python
│   ├── 📄 calculadora.py       # Motor de cálculos principal
│   └── 📄 gestor.py            # Gestión de estado
│
└── 📂 .streamlit/              # Configuración Streamlit
    └── 📄 config.toml          # Config global de Streamlit
```

## 🚀 Funcionalidades Principales

### 💰 Cálculos de Nómina
- **Turnos regulares** con códigos predefinidos (ej: D1, 162CC, 284M)
- **Recargos automáticos** según franjas horarias:
  - Nocturno ordinario: +35%
  - Dominical diurno: +80%
  - Dominical nocturno: +210%
- **Horas extras** con diferentes tasas
- **Auxilio de transporte** ajustado por días trabajados
- **Cívicas (pasajes)** calculadas automáticamente

### ⚡ Eventos Especiales
| Evento | Efecto en Nómina |
|--------|-----------------|
| **Suspensión** | Sin pago, descuenta cívica y auxilio |
| **Licencia** | No remunerada, descuenta cívica y auxilio |
| **Compensatorio (CP)** | Paga 6 horas base, descuenta cívica |
| **Incapacidad** | Paga 66.67%, descuenta cívica y auxilio |

### 📊 Deducciones Legales
- **Salud (4%)** - Aportes obligatorios
- **Pensión (4%)** - Aportes obligatorios
- **Deducciones manuales** - Préstamos, fondos, seguros

## 🎨 Características de UI/UX

### Interfaz Streamlit (Legacy)
- Diseño con CSS customizado y gradientes modernos
- Navegación por pestañas: Configuración | Registros | Resultado
- Input inteligente con validación en tiempo real
- Cards visuales para resultados
- Notificaciones toast no intrusivas

### Interfaz Next.js (Moderna)
- **Diseño Responsive** - Mobile-first approach
- **Componentes Reutilizables** - Arquitectura basada en componentes
- **Animaciones Fluidas** - Framer Motion para transiciones
- **Estado Global** - Zustand para manejo de estado
- **Formularios Validados** - React Hook Form + Zod
- **Tailwind CSS** - Diseño moderno y consistente
- **TypeScript** - Tipado estático para mayor calidad

## 🔧 Instalación y Ejecución

### Opción 1: Aplicación Streamlit (Recomendada para desarrollo rápido)

1. **Instalar Python 3.10+**
   ```bash
   python --version
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar aplicación**
   ```bash
   streamlit run app.py
   ```

5. **Abrir en navegador**
   - Acceder a `http://localhost:8501`

### Opción 2: Arquitectura Full Stack (Next.js + FastAPI)

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

#### Acceder a la aplicación
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 📋 Endpoints de API

### Turnos
- `GET /api/turnos` - Lista todos los turnos disponibles
- `GET /api/turnos/{codigo}` - Obtiene un turno específico

### Cálculos
- `POST /api/calcular` - Calcula nómina completa
- `POST /api/eventos/cp` - Agrega compensatorio
- `POST /api/eventos/suspension` - Agrega suspensión
- `POST /api/eventos/licencia` - Agrega licencia
- `POST /api/eventos/incapacidad` - Agrega incapacidad
- `POST /api/eventos/extra` - Agrega horas extras
- `POST /api/eventos/deduccion` - Agrega deducción manual
- `POST /api/eventos/dispo` - Agrega tiempo disponible

## 🧮 Lógica de Cálculo

### Fórmulas Principales

#### Salario Base
```
Salario Base = Días Trabajados × Valor Día Básico
```

#### Recargos
```
Recargo Nocturno = Horas Nocturnas × Valor Hora × 1.35
Recargo Dominical Diurno = Horas Dominicales Diurnas × Valor Hora × 1.80
Recargo Dominical Nocturno = Horas Dominicales Nocturnas × Valor Hora × 3.10
```

#### Auxilio de Transporte
```
Auxilio = (Días Trabajados / Días Quincena) × Auxilio Mensual
```

#### Deducciones
```
Salud = (Salario Base + Recargos) × 0.04
Pensión = (Salario Base + Recargos) × 0.04
```

#### Neto a Pagar
```
Neto = Devengados + Auxilio + Cívicas - Deducciones
```

## 🔐 Seguridad y Validación

### Validaciones
- **Códigos de turno** validados contra base de datos
- **Rangos de valores** para inputs numéricos
- **Tipos de datos** con TypeScript y Pydantic
- **CORS configurado** para comunicación segura

### Seguridad
- Sin almacenamiento de datos sensibles
- Cálculos transparentes y auditables
- Validación de entrada en frontend y backend
- Sin base de datos (stateless)

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome/Edge (Recomendado)
- Firefox (Soporte completo)
- Safari (iOS soportado)
- Navegadores móviles (Diseño responsive)

### Requisitos del Sistema
- **Python 3.10+** (Streamlit)
- **Node.js 18+** (Next.js)
- **4GB RAM** recomendado
- **1GB espacio en disco**

## 🚀 Despliegue

### Streamlit Cloud
```bash
# Conectar repositorio a Streamlit Cloud
streamlit run app.py --server.port 8501
```

### Vercel (Next.js)
```bash
# Desplegar frontend
cd frontend
vercel --prod
```

### Docker
```dockerfile
# Para producción con contenedores
FROM python:3.10-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 8501
CMD ["streamlit", "run", "app.py"]
```

## 🤝 Contribución

### Estructura de Desarrollo
1. **Features** en branches separados
2. **Code review** obligatorio
3. **Tests** para nuevas funcionalidades
4. **Documentación** actualizada

### Guías de Estilo
- **Python**: PEP 8
- **TypeScript**: ESLint + Prettier
- **Componentes**: Atomic Design
- **Commits**: Conventional Commits

## 📊 Métricas y Monitoreo

### KPIs de Aplicación
- **Tiempo de respuesta** < 2s
- **Uptime** 99.9%
- **Errores** < 0.1%
- **Satisfacción** usuario > 4.5/5

### Monitoreo
- Logs de errores
- Métricas de uso
- Performance tracking
- User analytics

## 🔄 Versionado

### v2.0.0 (Actual)
- Arquitectura Next.js + FastAPI
- TypeScript completo
- UI moderna con Tailwind CSS
- Estado global con Zustand

### v1.0.0 (Legacy)
- Streamlit puro
- Python básico
- CSS customizado
- Estado local

## 📞 Soporte

### Contacto
- **Desarrollador**: Reiber
- **Email**: [tu-email@ejemplo.com]
- **Issues**: GitHub Issues

### Documentación Adicional
- **API Docs**: `/docs` (FastAPI)
- **Component Guide**: Wiki del proyecto
- **Troubleshooting**: FAQ en repositorio

---

**Desarrollado con ❤️ por Reiber**  
*Calculadora de nómina especializada para conductores TA en Colombia*
