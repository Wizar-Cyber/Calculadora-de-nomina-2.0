// Test API connection from browser context
const testConnection = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/turnos');
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Connection Error:', error);
    return null;
  }
};

testConnection();
