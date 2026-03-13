# 🚀 Guía de Deployment a Netlify

Guía paso a paso para deployar la Calculadora de Nómina en Netlify.

---

## ✅ Pre-requisitos

1. Repositorio en GitHub
2. Cuenta en Netlify (gratuita)
3. Proyecto Next.js actualizado a v2.0

---

## 📋 Paso 1: Preparar el Repositorio

### 1.1 Verificar estructura

```bash
git status
# Debe mostrar solo cambios intencionales
```

### 1.2 Commit inicial

```bash
git add .
git commit -m "v2.0: Backend migrado a Next.js integrado"
git push origin main
```

---

## 🔗 Paso 2: Conectar en Netlify

### 2.1 Crear cuenta
- Ir a https://netlify.com
- Registrarse con GitHub

### 2.2 Importar repositorio
1. Click en "New site from Git"
2. Seleccionar GitHub
3. Buscar `Calculadora-de-nomina-2.0`
4. Hacer click

### 2.3 Configurar build

**Build settings:**
```
Base directory:   frontend
Build command:    npm run build
Publish directory: frontend/.next
```

---

## 🔐 Paso 3: Variables de Entorno

En Netlify → **Site settings → Build & Deploy → Environment**

Agregar:

| Clave | Valor |
|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api` |

---

## ⚙️ Paso 4: netlify.toml

Crear en raíz del proyecto:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "20.11.0"
```

---

## 🔄 Paso 5: Deploy

### Automático (Recomendado)
```bash
git push origin main
# Netlify automáticamente deploya
```

### Manual
En Netlify dashboard → **Deploys → Trigger Deploy**

---

## ✨ Verificar

1. Acceder a `https://tu-sitio.netlify.app`
2. Probar API: `https://tu-sitio.netlify.app/api/turnos`
3. Hacer cálculo de prueba

---

## 🎉 ¡Listo!

App en producción sin latencias 🚀
