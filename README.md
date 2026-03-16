# 📊 Calculadora de Nómina - Conductores TA

Aplicación web para cálculo de nómina por quincena, con API integrada y desglose detallado de devengados/deducciones.

Desarrollado con **Next.js 15** + **TypeScript** + **Tailwind CSS**.

---

## 🚀 Inicio rápido

```bash
# 1) Instalar dependencias
cd frontend
npm install

# 2) Desarrollo
npm run dev

# 3) Build de producción
npm run build
```

Abrir en: `http://localhost:3000`

---

## 🏗️ Estructura (resumen)

```
frontend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── v1/
│   │           ├── turnos/
│   │           ├── calcular/
│   │           └── calcular-con-eventos/
│   ├── components/
│   ├── lib/
│   │   ├── calculadora-v2.ts
│   │   ├── calculadora.ts
│   │   ├── config.ts
│   │   ├── turno.ts
│   │   └── turnos-data.ts
│   └── store/
│       └── usePayrollStore.ts
└── package.json
```

---

## ✅ Funcionalidades actuales

- Cálculo de nómina por quincena (`15` y `30`).
- Gestión de turnos por código.
- Eventos: incapacidad, `Susp/Lic`, compensatorio (CP), extras, deducciones manuales y dispo.
- Cívicas configurables por usuario (no hardcodeadas).
- Colilla con desglose de devengados y deducciones.
- API integrada en Next.js (`/api/v1/*`).

---

## 🔌 API (v1)

Endpoints recomendados:

- `GET /api/v1/turnos`
- `POST /api/v1/calcular`
- `POST /api/v1/calcular-con-eventos`

Ejemplo básico:

```bash
curl -X POST http://localhost:3000/api/v1/calcular \
  -H "Content-Type: application/json" \
  -d '{"quincena":"30","turnos":["250M"],"civicas":0}'
```

Ejemplo con eventos:

```bash
curl -X POST http://localhost:3000/api/v1/calcular-con-eventos \
  -H "Content-Type: application/json" \
  -d '{
    "quincena":"30",
    "turnos":["250M"],
    "eventos":[{"tipo":"extra","minutos":60,"recargo":0.35}],
    "civicas":5
  }'
```

---

## 💰 Reglas de negocio (config actual)

Definidas en `frontend/src/lib/config.ts`:

- Salario básico mensual: **$2,347,526**
- Salario quincena: **$1,173,763**
- Valor hora: **$13,041.81**
- Recargo nocturno ordinario: **35%**
- Recargos festivos: **80% / 210%**
- Salud: **4%**
- Pensión: **4%**
- Auxilio transporte mensual: **$200,000**
- Cívica por pasaje: **$3,820**

---

## 📝 Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

---

## ☁️ Deploy en Vercel (recomendado)

1. Subir proyecto a GitHub.
2. Importar repo en Vercel.
3. Configurar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Variable de entorno:
   - `NEXT_PUBLIC_API_BASE_URL=/api`
5. Deploy.

---

## 🧪 Troubleshooting rápido

### Error 404 en chunks (`/_next/static/chunks/...`)
Suele ser caché de `.next` o múltiples dev servers.

Solución recomendada:

1. Cerrar servidores `npm run dev` activos.
2. Borrar `frontend/.next` (y opcional `frontend/node_modules/.cache`).
3. Ejecutar de nuevo `npm run dev`.
4. Recargar navegador con `Ctrl + F5`.

### Error 400 al agregar un turno
Normalmente ocurre por formato de hora inválido en `turnos-data.ts`.
Formato válido: `HH:MM` (ejemplo `16:20`).

---

**Última actualización:** 15 de marzo de 2026
