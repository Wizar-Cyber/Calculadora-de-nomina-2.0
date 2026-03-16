/**
 * Script que se ejecuta en el cliente para diagnosticar la respuesta del API
 * Ejecutar en la consola del navegador.
 */

async function testAPIInBrowser() {
  console.log('🔬 [BROWSER TEST] Starting API test...\n');

  try {
    const response = await fetch('/api/v1/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quincena: '30',
        turnos: ['250M'],
        civicas: 0
      })
    });

    if (!response.ok) {
      console.error('❌ Response not OK:', response.status);
      return;
    }

    const json = await response.json();
    console.log('✅ Response received');
    console.log('Full response:', json);
    console.log('\n📊 response.data:', json.data);
    console.log('\n🔍 response.data.desglose_devengados:', json.data.desglose_devengados);
    console.log('Object keys:', Object.keys(json.data.desglose_devengados || {}));
    console.log('\n🔍 response.data.desglose_deducciones:', json.data.desglose_deducciones);
    console.log('Object keys:', Object.keys(json.data.desglose_deducciones || {}));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar el test
testAPIInBrowser();
