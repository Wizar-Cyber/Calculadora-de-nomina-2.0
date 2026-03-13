/**
 * Configuración de Next.js
 * 
 * IMPORTANTE: No activar output: 'export' porque desactiva:
 * - API Routes dinámicas (/api/*)
 * - Server-side rendering
 * - Middleware
 * 
 * Todas nuestras rutas de cálculo (/api/turnos, /api/calcular, etc.)
 * requieren un servidor Node.js activo (que proporciona Netlify automáticamente).
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ⚠️ DESHABILITADO: output: 'export' previene API Routes dinámicas
  // Si lo necesitaras, tendrías que usar static generation o ISR
  // output: 'export',
  
  // Configuración de imagen (si se necesita)
  images: {
    unoptimized: true, // Útil para deployment estático
  },
};

module.exports = nextConfig;
