# 🚀 Guía de Despliegue - Calculadora de Nómina

## Despliegue en Netlify (Frontend) + Backend Remoto

### Requisitos
- Cuenta en Netlify (https://netlify.com)
- Repositorio en GitHub con el código
- Backend desplegado en un servidor (ej: Heroku, PythonAnywhere, AWS, etc.)
- URL del backend API accesible desde internet

---

## 📍 Paso 1: Preparar el Backend

Tu backend debe estar desplegado en un servidor accesible desde internet.

### Opciones para desplegar el backend:

#### **Opción A: Heroku (Gratis con limitaciones)**
```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Crear app
heroku create tu-app-nomina

# 4. Desplegar
git push heroku main

# 5. Tu URL será: https://tu-app-nomina.herokuapp.com
```

#### **Opción B: PythonAnywhere (Gratis)**
- Ir a https://www.pythonanywhere.com
- Crear cuenta
- Subir código
- Configurar app web
- Tu URL será: https://tu-usuario.pythonanywhere.com

#### **Opción C: AWS/DigitalOcean/Render**
- Documentación en sus sitios respectivos
- Precios varían

**Importante:** Asegúrate de que el backend esté corriendo y accesible en `https://tu-backend-url.com`

---

## 📋 Paso 2: Configurar Variables de Entorno en Netlify

### 2.1 Conectar el repositorio a Netlify

1. Ve a https://netlify.com
2. Click en "Add new site" → "Import an existing project"
3. Selecciona GitHub y autoriza
4. Selecciona el repositorio `Calculadora-de-nomina-2.0`
5. Click en "Import"

### 2.2 Configurar Build Settings

En la página de configuración, establece:

**Build command:**
```bash
npm run build
```

**Publish directory:**
```
frontend/.next
```

**Base directory:**
```
frontend
```

### 2.3 Agregar Variables de Entorno

1. Ve a **Site settings** → **Build & deploy** → **Environment**
2. Click en **Edit variables**
3. Agrega la siguiente variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://tu-backend-url.com/api` |

**Ejemplo:**
```
NEXT_PUBLIC_API_BASE_URL=https://tu-app-nomina.herokuapp.com/api
```

---

## 🔗 Paso 3: Configurar CORS en el Backend

El backend debe permitir peticiones desde tu sitio de Netlify.

En `backend/main.py`, verifica que `allow_origins` incluya:
```python
allow_origins=[
    "http://localhost:3000",
    "https://*.netlify.app",  # ← Esto permite cualquier sitio de Netlify
]
```

**Si tu backend está en Heroku, Render, etc., el CORS ya debería estar configurado.**

---

## 🧪 Paso 4: Desplegar el Frontend

1. **Push a GitHub:**
```bash
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

2. **Netlify desplegará automáticamente** cuando detecte cambios en `main`

3. **Espera a que termine el build:**
   - Ve a tu sitio en Netlify
   - Verifica que el build fue exitoso
   - Tu URL será algo como: `https://tu-sitio.netlify.app`

---

## ✅ Paso 5: Verificar que todo funciona

### 5.1 Test en navegador

1. Abre https://tu-sitio.netlify.app
2. Abre la consola (F12)
3. Ve a la pestaña "Network"
4. Intenta agregar un turno
5. Verifica que los requests van a tu backend

**Deberías ver solicitudes a:** `https://tu-backend-url.com/api/calcular-con-eventos`

### 5.2 Si ves error 404

**Soluciona:**

1. **Verifica la URL del backend:**
   ```bash
   curl https://tu-backend-url.com/api/turnos
   ```
   Debe retornar: `{"turnos": [...]}`

2. **Verifica la variable de entorno en Netlify:**
   - Site settings → Build & deploy → Environment
   - Confirma que `NEXT_PUBLIC_API_BASE_URL` es correcta

3. **Redeploy manual:**
   - En Netlify, ve a **Deployments**
   - Click en el botón **Trigger deploy** → **Deploy site**

4. **Limpia caché del navegador:**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

---

## 📝 Checklist de Despliegue

- [ ] Backend está desplegado en un servidor público
- [ ] Backend URL es accesible desde internet (ej: `https://tu-backend.com/api/turnos`)
- [ ] Repositorio está en GitHub
- [ ] Netlify está conectado al repositorio
- [ ] Variable `NEXT_PUBLIC_API_BASE_URL` configurada en Netlify
- [ ] `backend/main.py` permite CORS desde `*.netlify.app`
- [ ] Build de Netlify fue exitoso (sin errores)
- [ ] Aplicación abre sin errores en https://tu-sitio.netlify.app
- [ ] Puedo agregar turnos sin errores 404

---

## 🐛 Troubleshooting

### Error: "Failed to load resource: 404"

**Causas posibles:**

1. **Backend URL es incorrecta**
   - Verifica en Netlify → Build & deploy → Environment
   - Ejemplos correctos:
     - `https://tu-app.herokuapp.com/api`
     - `https://tu-usuario.pythonanywhere.com/api`
     - `https://tu-backend.render.com/api`

2. **Backend no está corriendo**
   - Abre https://tu-backend-url.com/api/turnos en el navegador
   - Si retorna error, el backend no está activo

3. **CORS no configurado**
   - Backend debe incluir `*.netlify.app` en `allow_origins`
   - Si no, agrega y redeploy el backend

### Error: "Network request failed"

**Causa:** El backend no es accesible desde internet
- Verifica que está corriendo en su servidor
- Verifica que el firewall permite acceso
- Prueba acceder a la URL del backend desde navegador

### Error: "Mixed Content"

**Causa:** Frontend en HTTPS intenta conectar a HTTP
- **Solución:** Backend debe usar HTTPS
- Configura SSL/TLS en tu servidor backend

---

## 📞 Ejemplo Completo

### Si tu backend está en Heroku:

**Paso 1:** Desploy backend en Heroku
```bash
git remote add heroku https://git.heroku.com/tu-app-nomina.herokuapp.com.git
git push heroku main
# URL final: https://tu-app-nomina.herokuapp.com
```

**Paso 2:** En Netlify, agrega variable:
```
NEXT_PUBLIC_API_BASE_URL=https://tu-app-nomina.herokuapp.com/api
```

**Paso 3:** Redeploy en Netlify
- Netlify → Deployments → Trigger deploy

**Resultado:**
- Frontend: https://tu-sitio.netlify.app
- Backend: https://tu-app-nomina.herokuapp.com/api

---

## 🔐 Consideraciones de Seguridad

1. **Nunca commits credenciales** en GitHub
2. **Usa variables de entorno** para URLs sensibles
3. **Habilita CORS solo para tu dominio** en producción
4. **Usa HTTPS** siempre en producción
5. **Valida inputs** en el backend

---

## 📚 Referencias

- [Netlify Docs](https://docs.netlify.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

---

**¿Necesitas ayuda?** Contacta a tu equipo de desarrollo.
