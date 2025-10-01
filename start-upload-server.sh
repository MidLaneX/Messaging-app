#!/bin/bash

# Simple startup script for the upload server

echo "Starting Messaging App Upload Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules_upload" ]; then
    echo "Installing backend dependencies..."
    
    # Install dependencies using the package.json we created
    cp upload-server-package.json package_upload.json
    npm install --prefix upload_server --package-lock-only=false \
        express multer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner cors
    
    echo "Backend dependencies installed."
fi

# Check if .env.upload exists
if [ ! -f ".env.upload" ]; then
    echo "Error: .env.upload file not found. Please create it with your R2 credentials."
    echo "Example:"
    echo "R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com"
    echo "R2_ACCESS_KEY_ID=your-access-key-id"
    echo "R2_SECRET_ACCESS_KEY=your-secret-access-key"
    echo "R2_BUCKET_NAME=your-bucket-name"
    echo "R2_PUBLIC_URL=https://your-bucket.your-domain.com"
    echo "PORT=3001"
    exit 1
fi

# Load environment variables and start the server
echo "Loading environment variables from .env.upload..."
export $(cat .env.upload | xargs)

echo "Starting upload server on port ${PORT:-3001}..."
node upload-server.js