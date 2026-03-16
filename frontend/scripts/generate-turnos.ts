#!/usr/bin/env node
/**
 * Script para auto-generar turnos-data.ts desde turnos.json
 * Ejecutar: npm run generate:turnos
 * 
 * Ventajas:
 * - Una única fuente de verdad (turnos.json)
 * - Sincronización automática
 * - Fácil de mantener
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../');
const jsonPath = path.join(projectRoot, 'public/turnos.json');
const tsPath = path.join(projectRoot, 'src/lib/turnos-data.ts');

try {
  // Leer JSON
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const turnos = JSON.parse(jsonContent);

  // Validar estructura
  if (!Array.isArray(turnos)) {
    throw new Error('turnos.json debe ser un array');
  }

  if (turnos.length === 0) {
    throw new Error('turnos.json está vacío');
  }

  // Generar contenido TypeScript
  const tsContent = `/**
 * ARCHIVO AUTO-GENERADO
 * NO EDITAR MANUALMENTE
 * 
 * Generado desde: frontend/public/turnos.json
 * Comando: npm run generate:turnos
 * Fecha: ${new Date().toISOString()}
 * 
 * Total de turnos: ${turnos.length}
 */

import type { ITurno } from './turno';

const turnos: ITurno[] = ${JSON.stringify(turnos, null, 2)};

export default turnos;
`;

  // Escribir archivo TypeScript
  fs.writeFileSync(tsPath, tsContent, 'utf-8');

  console.log(`✓ Generado: ${tsPath}`);
  console.log(`✓ Total de turnos: ${turnos.length}`);
  console.log(`✓ Categorías:`);

  const cc = turnos.filter(t => t.codigo.endsWith('CC')).length;
  const tt = turnos.filter(t => t.codigo.endsWith('TT')).length;
  const m = turnos.filter(t => t.codigo.endsWith('M')).length;

  console.log(`  - CC (festivos): ${cc}`);
  console.log(`  - TT (ordinarios): ${tt}`);
  console.log(`  - M (ordinarios): ${m}`);
  console.log(`\n✓ turnos-data.ts actualizado correctamente`);
} catch (error) {
  console.error('❌ Error generando turnos-data.ts:', error);
  process.exit(1);
}
