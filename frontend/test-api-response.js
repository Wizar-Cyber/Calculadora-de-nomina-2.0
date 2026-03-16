/**
 * Script de test para verificar cómo se procesa la respuesta del API en el cliente
 * Simula el flujo completo: API -> axios -> transformación -> store
 */

const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete API -> Store flow...\n');
    
    // Paso 1: Crear instancia de axios como en api.ts
    const api = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      withCredentials: false,
    });

    // Paso 2: Hacer solicitud como en calcularNomina
    console.log('📤 Step 1: Making API request...');
    const response = await api.post('/v1/calcular', {
      quincena: '30',
      turnos: ['250M'],
      civicas: 0,
    });

    console.log('✅ Response received');
    console.log('Response status:', response.status);
    console.log('Response.data keys:', Object.keys(response.data));

    // Paso 3: Extraer data como en calcularNomina
    console.log('\n📊 Step 2: Extracting response.data.data...');
    const data = response.data.data;
    
    if (!data) {
      console.error('❌ ERROR: response.data.data is undefined!');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      return;
    }

    console.log('✅ data extracted successfully');
    console.log('data keys:', Object.keys(data));
    console.log('Has desglose_devengados:', 'desglose_devengados' in data);
    console.log('Has desglose_deducciones:', 'desglose_deducciones' in data);

    // Paso 4: Simular creación de stateUpdate como en store
    console.log('\n🔄 Step 3: Creating stateUpdate (como en store)...');
    const stateUpdate = {
      devengado: data.devengado,
      deducciones: data.deducciones,
      neto: data.neto,
      auxilio: data.auxilio,
      civicas: data.civicas,
      desgloseDevengados: data.desglose_devengados || {},
      desgloseDeducciones: data.desglose_deducciones || {},
      diasTrabajados: data.dias_trabajados,
    };

    console.log('✅ stateUpdate created');
    console.log('stateUpdate.desgloseDevengados:', stateUpdate.desgloseDevengados);
    console.log('stateUpdate.desgloseDeducciones:', stateUpdate.desgloseDeducciones);
    console.log('stateUpdate keys:', Object.keys(stateUpdate));

    // Paso 5: Verificar que los valores no estén vacíos
    console.log('\n✔️ Final validation:');
    const devengadosIsEmpty = Object.keys(stateUpdate.desgloseDevengados).length === 0;
    const deduccionesIsEmpty = Object.keys(stateUpdate.desgloseDeducciones).length === 0;
    
    console.log('desgloseDevengados empty?', devengadosIsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO (OK)');
    console.log('desgloseDeducciones empty?', deduccionesIsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO (OK)');

    if (!devengadosIsEmpty) {
      console.log('\nDesgloseDevengados contents:');
      Object.entries(stateUpdate.desgloseDevengados).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
    }

    if (!deduccionesIsEmpty) {
      console.log('\nDesgloseDeducciones contents:');
      Object.entries(stateUpdate.desgloseDeducciones).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteFlow();

