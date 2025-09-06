require('dotenv').config();
const vars = {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL,
    NODE_ENV: process.env.NODE_ENV
};

console.log('\nCurrent Environment Variables:');
Object.entries(vars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${key}: ${value || 'NOT SET'}`);
});

// Check URL formats
if (vars.REACT_APP_API_URL) {
    const apiUrl = vars.REACT_APP_API_URL;
    if (apiUrl.startsWith('https://')) {
        console.log('✅ API URL uses HTTPS (secure)');
    } else if (apiUrl.startsWith('http://')) {
        console.log('⚠️  API URL uses HTTP (insecure for production)');
    } else {
        console.log('❌ Invalid API URL format');
    }
}

if (vars.REACT_APP_WS_URL) {
    const wsUrl = vars.REACT_APP_WS_URL;
    if (wsUrl.startsWith('wss://')) {
        console.log('✅ WebSocket URL uses WSS (secure)');
    } else if (wsUrl.startsWith('ws://')) {
        console.log('⚠️  WebSocket URL uses WS (insecure for production)');
    } else {
        console.log('❌ Invalid WebSocket URL format');
    }
}

// Clean up
const fs = require('fs');
fs.unlinkSync('check_env_temp.js');
