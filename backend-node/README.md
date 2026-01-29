# Backend Calculadora de Nómina - Node.js

Este es el backend de la aplicación Calculadora de Nómina, convertido de Python/FastAPI a Node.js/Express para facilitar la deploying en Netlify.

## Requisitos
- Node.js 18.x o superior
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo Local

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Estructura

```
backend-node/
├── server.js              # Express app con todas las rutas
├── services/
│   └── calculadora.js     # Lógica de cálculo de nómina
├── data/
│   └── turnos.json        # Base de datos de turnos
├── package.json           # Dependencias
└── README.md              # Este archivo
```

## API Endpoints

### GET /api/turnos
Retorna la lista completa de turnos disponibles.

### GET /api/turnos/:codigo
Retorna un turno específico por código.

### POST /api/calcular
Calcula nómina basada en turnos únicamente.

```json
{
  "quincena": 1,
  "turnos": [
    {
      "codigo": "250M",
      "fecha": "2024-01-01"
    }
  ]
}
```

### POST /api/calcular-con-eventos
Calcula nómina con todos los eventos (extras, deducciones, suspensiones, etc).

```json
{
  "quincena": 1,
  "turnos": [...],
  "eventos": [
    {
      "tipo": "extra",
      "minutos": 60,
      "recargo": 0.25,
      "nombre": "Extra 25%"
    }
  ],
  "extras": [...],
  "deduccion_manual": [...]
}
```

## Respuesta de Cálculo

```json
{
  "devengado": 400000,
  "desglose_devengado": {
    "salario_ordinario": 320000,
    "horas_extra": 80000
  },
  "deducciones": {
    "eps": 16000,
    "pension": 16000,
    "sura": 20880
  },
  "neto": 347120
}
```

## Desploy en Netlify

1. Configura tu proyecto en Netlify
2. Las variables de entorno se configuran en el dashboard de Netlify
3. El backend se despliega automáticamente con el frontend

## Testing

Para testear localmente:

```bash
npm start
```

Luego abre [test-api.html](../test-api.json) en un navegador o usa Postman.
