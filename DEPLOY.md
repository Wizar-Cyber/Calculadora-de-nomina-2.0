# 🚀 Guía de Despliegue - Calculadora de Nómina

## Despliegue Unificado en Netlify (Frontend + Backend Node.js)

### Requisitos
- Cuenta en Netlify (https://netlify.com)
- Repositorio en GitHub con el código
- Node.js 18+ instalado localmente (para testing)

### Ventajas de esta arquitectura
- ✅ **Deployment único**: Todo en Netlify
- ✅ **Sin dependencias externas**: No necesitas múltiples servicios
- ✅ **CORS simplificado**: Frontend y backend en mismo dominio
- ✅ **Fácil mantenimiento**: Un repositorio, una plataforma
- ✅ **Escalable**: Netlify maneja automáticamente el tráfico

---

## 📍 Paso 1: Preparar el Backend Localmente

### Instalar dependencias del backend

```bash
cd backend-node
npm install
```

### Verificar que funciona

```bash
npm start
```

Deberías ver: `Servidor corriendo en puerto 3001`

### Testear endpoints

```bash
# Obtener turnos
curl http://localhost:3001/api/turnos

# Calcular nómina
curl -X POST http://localhost:3001/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"quincena":"1","turnos":["250M"]}'
```

---

## 📋 Paso 2: Verificar Configuración Frontend

El frontend debe tener la variable correcta en `.env.local`:

```plaintext
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

Para producción en Netlify, esta URL apuntará automáticamente al backend de Netlify.

---

## 📍 Paso 3: Conectar el repositorio a Netlify

1. Ve a https://netlify.com
2. Click en "Add new site" → "Import an existing project"
3. Selecciona GitHub y autoriza
4. Selecciona el repositorio `Calculadora-de-nomina-2.0`
5. Click en "Import"

### 3.1 Configurar Build Settings

En la página de configuración, Netlify debería detectar automáticamente:

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
(dejar vacío - raíz del proyecto)
```

Si NO se detecta automáticamente, configúralo manualmente:
1. Ve a **Site settings** → **Build & deploy** → **Build settings**
2. Edita y configura los valores arriba

### 3.2 Archivo netlify.toml

El archivo `netlify.toml` en la raíz ya está configurado para:
- Servir el frontend desde `frontend/.next`
- Redirigir peticiones `/api/*` al backend Node.js
- Manejar rutas del SPA correctamente

No necesitas hacer nada más, Netlify lo lee automáticamente.

---

## 🚀 Paso 4: Desplegar en Netlify

### 4.1 Push a GitHub

```bash
cd "tu-proyecto/Calculadora de nomina"
git add .
git commit -m "Ready for Netlify deployment with Node.js backend"
git push origin main
```

### 4.2 Netlify desplegará automáticamente

1. Netlify detectará los cambios en `main`
2. Ejecutará los comandos de build
3. El deploy debería tomar ~3-5 minutos

### 4.3 Monitorear el deploy

En tu panel de Netlify:
1. Ve a **Deployments**
2. Deberías ver un nuevo deploy en progreso
3. Haz click en él para ver los logs
4. Espera a que complete con estado "Published"

---

## ✅ Paso 5: Verificar que todo funciona

### 5.1 Test en navegador

1. Abre tu sitio en Netlify (ej: `https://tu-sitio.netlify.app`)
2. Abre la consola del navegador (F12)
3. Ve a la pestaña "Network"
4. Intenta agregar algunos turnos
5. Deberías ver solicitudes exitosas a `/api/calcular`

### 5.2 Verificar endpoints específicos

En el navegador, abre estas URLs:
```
https://tu-sitio.netlify.app/api/turnos
```

Deberías ver una lista de turnos en JSON.

### 5.3 Si ves error en los cálculos:

**Opción A:** Limpiar caché
```
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
```
Luego recarga la página.

**Opción B:** Forzar redeploy
- En Netlify: Deployments → Trigger deploy → Deploy site

**Opción C:** Revisar los logs
- En Netlify: Deployments → (selecciona el último) → Deploy log
- Busca errores (líneas en rojo)



---

## 📝 Checklist de Despliegue en Netlify

- [ ] Repositorio está en GitHub
- [ ] Backend Node.js instalado localmente (`npm install` en `backend-node/`)
- [ ] Backend funciona localmente (`npm start` ✓)
- [ ] Repositorio conectado a Netlify
- [ ] `netlify.toml` está en el root del repositorio
- [ ] Variables de entorno configuradas (si es necesario)
- [ ] Build en Netlify fue exitoso
- [ ] Aplicación abre sin errores en el sitio de Netlify
- [ ] Puedo agregar turnos y calcular nómina sin errores
- [ ] Las solicitudes a `/api/*` funcionan correctamente

---

## 🐛 Troubleshooting

### Error: "404 Not Found" para endpoints API

**Causas posibles:**

1. **`netlify.toml` no está en el root**
   - Verifica que exista en la raíz del proyecto
   - Netlify debe detectarlo automáticamente

2. **Backend no se compiló**
   - Revisa los logs del deploy en Netlify
   - Busca errores en npm install o npm build

3. **Variables de entorno no configuradas**
   - Ve a Site settings → Build & deploy → Environment
   - Verifica que todas las variables están presentes

**Solución:**
```
En Netlify: Deployments → Trigger deploy → Deploy site
```

### Error: "Network request failed"

**Causa:** Las rutas de API no están correctamente configuradas

**Solución:**
1. Verifica que `netlify.toml` contiene:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/api/:splat"
     status = 200
   ```

2. Fuerza un redeploy en Netlify

### Error: "Build failed"

**Causa:** Errores durante npm install o npm build

**Pasos para resolver:**

1. **Revisar los logs:**
   - En Netlify: Deployments → (último deploy) → Deploy log
   - Busca la línea que dice "Error"

2. **Probar localmente:**
   ```bash
   # Test backend
   cd backend-node
   npm install
   npm start
   
   # En otra terminal, test frontend
   cd frontend
   npm install
   npm run build
   ```

3. **Si encuentra errores, corrígelos localmente**

4. **Push a GitHub y Netlify redeploy automáticamente**

### Error: "Mixed Content"

**Causa:** Frontend (HTTPS) intenta conectar a un backend HTTP

Esto no debería ocurrir con esta arquitectura unificada. Si sucede:
1. Verifica que usas URLs relativas (`/api/*`) en lugar de absolutas
2. Asegúrate de que Netlify sirve TODO bajo HTTPS

### La aplicación carga pero los cálculos no funcionan

1. **Abre la consola del navegador (F12)**
2. **Ve a la pestaña Network**
3. **Intenta hacer una acción que falla**
4. **Busca solicitudes a `/api/*`**
   - Si ves 404: El backend no está siendo encontrado
   - Si ves 500: El backend tiene un error
   - Si vez timeout: El backend está lento

5. **Haz click en la solicitud fallida**
6. **Ve a la pestaña "Response"**
7. **Lee el mensaje de error**

---

## 📞 Ejemplo Completo de Despliegue

### Paso a paso:

```bash
# 1. Asegurar que todo está commitido
cd ~/Proyectos/Calculadora\ de\ nomina
git status

# 2. Si hay cambios, hacer commit
git add .
git commit -m "Ready for Netlify deployment"

# 3. Push a GitHub
git push origin main
```

### En Netlify Dashboard:

1. Ve a tu sitio en Netlify
2. Ve a **Deployments**
3. Deberías ver un deploy en progreso o completado
4. Si está completado, haz click en el botón o URL para abrirlo
5. ¡Tu aplicación está lista! 🎉

### URL Final:
```
https://tu-sitio.netlify.app
```

---

## 🔐 Consideraciones de Seguridad

1. **Nunca commits credenciales** en GitHub
2. **Usa variables de entorno** para datos sensibles
3. **CORS está configurado** para Netlify automáticamente
4. **HTTPS está habilitado** automáticamente por Netlify
5. **Backend valida todos los inputs**

---

## 🎯 Próximos Pasos

Después del deployment exitoso:

1. **Comunicar URL a usuarios**
   - Compartir: `https://tu-sitio.netlify.app`

2. **Monitorear el uso**
   - Analytics en Netlify dashboard
   - Errores en la consola del navegador

3. **Actualizaciones futuras**
   - Cualquier cambio en `main` se deploya automáticamente
   - Los logs están disponibles en Netlify

4. **Agregar dominio personalizado** (opcional)
   - Site settings → Domain management → Add custom domain
   - Sigue las instrucciones para validar

---

## 📚 Referencias

- [Netlify Complete Docs](https://docs.netlify.com/)
- [netlify.toml Reference](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment/netlify)

---

**¿Necesitas ayuda?** Contacta a tu equipo de desarrollo.

Última actualización: 2024
Arquitectura: Next.js Frontend + Node.js Express Backend en Netlify

