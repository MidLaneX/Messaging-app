#!/bin/bash

# Environment Configuration Verification Script
# This script checks if the environment variables are properly configured

echo "🔍 Messaging App Environment Configuration Check"
echo "=================================================="

# Check if .env files exist
echo -e "\n📁 Environment Files:"
if [ -f ".env" ]; then
    echo "✅ .env exists"
else
    echo "❌ .env missing"
fi

if [ -f ".env.development" ]; then
    echo "✅ .env.development exists"
else
    echo "⚠️  .env.development missing (optional)"
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
else
    echo "❌ .env.production missing (required for production)"
fi

# Check environment variables
echo -e "\n🔧 Environment Variables:"

# Check if we're in a Node.js environment to read React environment variables
if command -v node >/dev/null 2>&1; then
    # Create a temporary Node.js script to check environment variables
    cat > check_env_temp.js << 'EOF'
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
EOF

    if command -v npm >/dev/null 2>&1; then
        # Install dotenv if not available
        if ! npm list dotenv >/dev/null 2>&1; then
            echo "Installing dotenv for environment check..."
            npm install dotenv --no-save >/dev/null 2>&1
        fi
        node check_env_temp.js
    else
        echo "npm not available, skipping detailed environment variable check"
        rm -f check_env_temp.js
    fi
else
    echo "Node.js not available, skipping environment variable check"
fi

# Check package.json scripts
echo -e "\n📝 Build Scripts:"
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json; then
        echo "✅ Build script found in package.json"
    else
        echo "❌ Build script missing in package.json"
    fi
    
    if grep -q '"start"' package.json; then
        echo "✅ Start script found in package.json"
    else
        echo "❌ Start script missing in package.json"
    fi
else
    echo "❌ package.json not found"
fi

echo -e "\n🚀 Quick Start Commands:"
echo "Development: npm start"
echo "Production build: npm run build"
echo "Test environment: npm test"

echo -e "\n📖 For detailed setup instructions, see ENVIRONMENT_SETUP.md"
