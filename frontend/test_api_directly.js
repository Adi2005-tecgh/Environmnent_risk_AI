// Test API directly from frontend perspective
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

async function testAPI() {
    console.log('Testing API from frontend perspective...');
    
    try {
        // Test risk endpoint
        const riskResponse = await api.get('/api/risk/Delhi');
        console.log('Risk API Response:', riskResponse.data);
        console.log('Risk pollutants:', riskResponse.data.pollutants);
        console.log('Risk AQI:', riskResponse.data.latest_aqi);
        
        // Test predict endpoint  
        const predictResponse = await api.get('/api/predict/Delhi');
        console.log('Predict API Response:', predictResponse.data);
        
    } catch (error) {
        console.error('API Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

testAPI();
