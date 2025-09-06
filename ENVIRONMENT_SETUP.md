# Environment Configuration for Production Deployment

This messaging application uses environment variables to configure API endpoints and WebSocket connections for different environments (development, production, etc.).

## Environment Variables

The application uses the following environment variables:

### React Environment Variables (Required)
- `REACT_APP_API_URL` - The base URL for REST API calls
- `REACT_APP_WS_URL` - The WebSocket URL for real-time messaging

### Legacy Environment Variables (Optional - for backward compatibility)
- `API_BASE_URL` - Alternative name for API base URL  
- `WEBSOCKET_URL` - Alternative name for WebSocket URL

## Environment Files

The project supports different environment configurations:

### `.env` (Default/Local Development)
```properties
REACT_APP_API_URL="http://localhost:8090"
REACT_APP_WS_URL="ws://localhost:8090"
```

### `.env.development` (Development Environment)
```properties
REACT_APP_API_URL="http://localhost:8090"
REACT_APP_WS_URL="ws://localhost:8090"
```

### `.env.production` (Production Environment)
```properties
REACT_APP_API_URL="https://your-production-api.com"
REACT_APP_WS_URL="wss://your-production-api.com"
```

## Production Deployment Setup

### 1. Update Production URLs

Edit `.env.production` and replace the placeholder URLs with your actual production endpoints:

```properties
# Replace with your actual production API URL
REACT_APP_API_URL="https://api.yourdomain.com"
REACT_APP_WS_URL="wss://api.yourdomain.com"
```

### 2. Build for Production

Run the production build command:

```bash
npm run build
# or
pnpm build
# or  
yarn build
```

### 3. Deploy Built Files

The build process creates a `build/` directory containing the optimized production files. Deploy these files to your web server (Apache, Nginx, etc.).

### 4. Environment Variable Precedence

React environment variables are loaded in this order (later ones override earlier ones):

1. `.env`
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. System environment variables
4. Command line environment variables

## Usage in Code

The application uses these environment variables through the centralized constants file:

```typescript
// src/constants/index.ts
export const APP_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8090",
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || "ws://localhost:8090",
  // ... other config
} as const;
```

All API calls and WebSocket connections use these centralized constants:

```typescript
// WebSocket connection
const socketFactory = () => new SockJS(`${APP_CONFIG.API_BASE_URL}/ws`);

// HTTP requests
axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  // ... other config
});
```

## Security Considerations

### 1. HTTPS/WSS in Production
Always use HTTPS (`https://`) for API URLs and WSS (`wss://`) for WebSocket URLs in production to ensure secure communication.

### 2. CORS Configuration
Ensure your backend API is configured to accept requests from your frontend domain.

### 3. Environment Variables Security
- Never commit sensitive production URLs to version control
- Use different `.env.production` files for different deployment environments
- Consider using CI/CD environment variables instead of `.env` files in automated deployments

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check that WSS is used in production (not WS)
   - Verify firewall/proxy settings allow WebSocket connections
   - Ensure backend WebSocket endpoint is accessible

2. **API Calls Fail**
   - Verify the API URL is correct and accessible
   - Check CORS configuration on backend
   - Ensure HTTPS is used in production

3. **Environment Variables Not Loading**
   - Verify variable names start with `REACT_APP_`
   - Check for typos in variable names
   - Restart development server after changing `.env` files

### Debug Environment Variables

You can check which environment variables are being used by adding this to your code temporarily:

```typescript
console.log('Environment Variables:', {
  API_URL: process.env.REACT_APP_API_URL,
  WS_URL: process.env.REACT_APP_WS_URL,
  NODE_ENV: process.env.NODE_ENV
});
```

## Docker Deployment

If using Docker, you can override environment variables at runtime:

```bash
docker run -e REACT_APP_API_URL="https://production-api.com" \
           -e REACT_APP_WS_URL="wss://production-api.com" \
           your-messaging-app
```

## CI/CD Integration

For automated deployments, set environment variables in your CI/CD pipeline:

```yaml
# Example for GitHub Actions
env:
  REACT_APP_API_URL: ${{ secrets.PRODUCTION_API_URL }}
  REACT_APP_WS_URL: ${{ secrets.PRODUCTION_WS_URL }}
```

This ensures your production URLs remain secure and separate from your codebase.
