# Backend Upload Server Setup

This backend server handles file uploads to Cloudflare R2 and solves CORS issues for browser-based uploads.

## Installation

```bash
# Install backend dependencies
npm install express multer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner cors
npm install --save-dev @types/express @types/multer @types/cors
```

## Environment Configuration

Create a `.env.upload` file with your Cloudflare R2 credentials:

```bash
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.your-domain.com
PORT=3001
```

## Running the Upload Server

```bash
# Load environment variables and start the server
export $(cat .env.upload | xargs) && node upload-server.js
```

## Frontend Configuration

Add this to your React app's `.env` file:

```bash
REACT_APP_BACKEND_URL=http://localhost:3001
```

## Features

### Direct Upload Endpoint
- **POST** `/api/upload`
- Upload files directly through the backend
- Automatic progress tracking
- File validation and processing

### Presigned URL Endpoint
- **POST** `/api/presigned-url`
- Get presigned URLs for direct client uploads
- More secure for production use
- Allows for custom upload logic

## Usage Examples

### Frontend Implementation

The ChatWindow component automatically tries:
1. Backend upload service (production-ready)
2. Browser upload service (fallback for development)

### Testing the Backend

```bash
# Test the upload endpoint
curl -X POST \
  -F "file=@test-image.png" \
  http://localhost:3001/api/upload

# Test presigned URL endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.png","contentType":"image/png"}' \
  http://localhost:3001/api/presigned-url
```

## Production Deployment

1. **CORS Configuration**: Update CORS origins for your production domain
2. **Environment Variables**: Set production R2 credentials
3. **File Validation**: Add additional security checks as needed
4. **Rate Limiting**: Consider adding rate limiting for production use
5. **Authentication**: Add user authentication if required

## Security Notes

- The backend validates file types and sizes
- Direct uploads bypass browser CORS restrictions
- Presigned URLs provide time-limited access
- Consider adding authentication for production use