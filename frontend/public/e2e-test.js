/**
 * Script de test E2E - Simula un usuario interactuando con la aplicación
 * Ejecutar en la consola del navegador después de cargar http://localhost:3000
 */

async function testE2E() {
  console.log('🌐 [E2E TEST] Starting end-to-end test...\n');

  try {
    // Step 1: Esperar que el store esté listo
    console.log('⏳ Step 1: Waiting for store to initialize...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Store should be initialized\n');

    // Step 2: Hacer una llamada API directamente para verificar
    console.log('📤 Step 2: Making direct API call...');
    const apiResponse = await fetch('/api/v1/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quincena: '30',
        turnos: ['250M'],
        civicas: 0
      })
    });

    const apiData = await apiResponse.json();
    console.log('✅ API Response received');
    console.log('API desglose_devengados keys:', Object.keys(apiData.data.desglose_devengados || {}));
    console.log('API desglose_deducciones keys:', Object.keys(apiData.data.desglose_deducciones || {}));

    // Step 3: Verificar lo que el navegador devTools muestra
    console.log('\n🔍 Step 3: [MANUAL CHECK] Look at:');
    console.log('- 🐛 DebugPanel en esquina inferior derecha');
    console.log('- Consola: busca logs con [STORE], [API], [PAYROLLSLIP]');
    console.log('- Red: verifica que POST /api/v1/calcular retorna 200\n');

    // Step 4: Instructions para test manual
    console.log('📋 Step 4: Manual test steps:');
    console.log('1. Busca la caja de búsqueda "Ej: D1, 162CC, 284M..."');
    console.log('2. Escribe "250M" (sin comillas)');
    console.log('3. Presiona Enter o click en botón + verde');
    console.log('4. Observa la consola para logs [STORE]');
    console.log('5. Verifica que desgloseDevengados no esté vacío en segundo log\n');

    console.log('🎯 Success criteria:');
    console.log('- ✅ PayrollSlip se renderiza con desglose NO vacío');
    console.log('- ✅ DebugPanel muestra desgloseDevengados: ✅ (con items)');
    console.log('- ✅ Devengados Card muestra "Salario Básico" y recargos\n');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Ejecutar automáticamente
testE2E();

// Exportar función para poder ejecutar de nuevo
window.testE2E = testE2E;
console.log('\n💡 Puedes ejecutar testE2E() nuevamente en cualquier momento');
