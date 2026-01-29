# Testing Backend API

Guía para testear el backend Node.js de la Calculadora de Nómina.

## Requisitos

- Node.js 18+ instalado
- npm instalado

## Instalación y Ejecución

### 1. Instalar dependencias

```bash
cd backend-node
npm install
```

### 2. Iniciar servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## Endpoints

### GET /api/turnos
Obtiene la lista de todos los turnos disponibles.

```bash
curl http://localhost:3001/api/turnos
```

### GET /api/turnos/:codigo
Obtiene un turno específico por código.

```bash
curl http://localhost:3001/api/turnos/250M
```

### POST /api/calcular
Calcula nómina basada en turnos únicamente.

**Formato del request:**
```json
{
  "quincena": "1",
  "turnos": ["250M", "250M"]
}
```

**Comando curl:**
```bash
curl -X POST http://localhost:3001/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"quincena":"1","turnos":["250M","250M"]}'
```

**Respuesta esperada:**
```json
{
  "devengado": 80000,
  "auxilio": 0,
  "civicas": 0,
  "deducciones": 6560,
  "neto": 73440,
  "desglose_devengados": {
    "salario_ordinario": 80000,
    "horas_extra": 0
  },
  "desglose_deducciones": {
    "eps": 3200,
    "pension": 3200,
    "sura": 4160
  },
  "dias_trabajados": 2,
  "turnos_count": 2,
  "detalles_turnos": [...],
  "tiene_cp": false,
  "dias_incapacidad": 0
}
```

### POST /api/calcular-con-eventos
Calcula nómina con eventos (extras, deducciones, suspensiones, etc).

**Formato del request:**
```json
{
  "quincena": "1",
  "turnos": ["250M"],
  "eventos": [
    {
      "tipo": "extra",
      "minutos": 60,
      "recargo": 0.25,
      "nombre": "Extra 25%"
    },
    {
      "tipo": "deduccion",
      "nombre": "Deducción manual",
      "valor": 10000
    }
  ]
}
```

**Tipos de eventos soportados:**
- `suspension` - Suspensión laboral
- `licencia` - Licencia remunerada
- `incapacidad` - Incapacidad laboral
- `cp` - Capacitación pagada
- `extra` - Horas extra (con campos: minutos, recargo, nombre)
- `deduccion` - Deducción manual (con campos: nombre, valor)
- `dispo` - Disponibilidad (con campos: inicio, fin, festivo)

**Comando curl:**
```bash
curl -X POST http://localhost:3001/api/calcular-con-eventos \
  -H "Content-Type: application/json" \
  -d '{
    "quincena":"1",
    "turnos":["250M"],
    "eventos":[
      {
        "tipo":"extra",
        "minutos":60,
        "recargo":0.25,
        "nombre":"Extra 25%"
      }
    ]
  }'
```

## Testing desde el Frontend

### 1. Asegurar que el .env.local está configurado correctamente

En `frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 2. Instalar y ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 3. Verificar que se conecta al backend

- Abre el navegador en `http://localhost:3000`
- Selecciona una quincena
- Añade algunos turnos
- Deberías ver que se calcula la nómina automáticamente

## Debugging

Si encuentras errores:

### 1. Verificar que el servidor está corriendo
```bash
curl http://localhost:3001
```

Deberías recibir una respuesta 200 OK

### 2. Revisar los logs del servidor
Los logs se imprimen en la consola donde ejecutaste `npm start`

### 3. Verificar la conectividad del frontend
Abre la consola del navegador (F12) y revisa la pestaña Network
Busca la request a `/api/turnos` y verifica que recibe respuesta 200

## Próximos pasos

1. Una vez que todo funciona localmente, haz push a GitHub:
   ```bash
   git push origin main
   ```

2. Deploying en Netlify:
   - Conecta tu repositorio de GitHub a Netlify
   - Netlify detectará automáticamente la configuración en `netlify.toml`
   - El deploy incluirá tanto frontend como backend

3. Configurar variables de entorno en Netlify dashboard si es necesario

## Arquitectura de la solución

- **Frontend**: Next.js (React + TypeScript) en puerto 3000
- **Backend**: Express.js en puerto 3001
- **Datos**: JSON estático (turnos.json)
- **Cálculos**: Clase CalculadoraNomina (JavaScript) con lógica de cálculo de nómina

## Archivos importantes

- `backend-node/server.js` - Express app con rutas API
- `backend-node/services/calculadora.js` - Lógica de cálculo
- `backend-node/data/turnos.json` - Base de datos de turnos
- `frontend/src/lib/api.ts` - Cliente API del frontend
- `frontend/src/store/usePayrollStore.ts` - State management
