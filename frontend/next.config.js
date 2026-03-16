/**
 * Configuración de Next.js
 * 
 * IMPORTANTE: No activar output: 'export' porque desactiva:
 * - API Routes dinámicas (/api/*)
 * - Server-side rendering
 * - Middleware
 * 
 * Todas nuestras rutas de cálculo (/api/turnos, /api/calcular, etc.)
 * requieren un runtime de servidor (Vercel lo provee automáticamente).
 */
const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Evita warning cuando hay lockfiles en raíz + frontend.
  outputFileTracingRoot: path.join(__dirname, '..'),
  
  // ⚠️ DESHABILITADO: output: 'export' previene API Routes dinámicas
  // Si lo necesitaras, tendrías que usar static generation o ISR
  // output: 'export',
  
  // Configuración de imagen (si se necesita)
  images: {
    unoptimized: true, // Útil para deployment estático
  },
};

module.exports = nextConfig;
