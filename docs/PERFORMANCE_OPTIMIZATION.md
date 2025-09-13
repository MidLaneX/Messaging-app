# Performance Optimization Guide for Google Cloud Run

## Performance Issues & Solutions

### 1. Bundle Size Optimization
The app bundle size significantly affects loading time, especially on mobile networks.

**Current optimizations:**
- Source maps disabled in production
- Tree shaking enabled
- Code splitting implemented
- Lazy loading for components

**To further optimize:**
```bash
# Analyze bundle size
npm run build:analyze

# Check what's included in the bundle
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Cloud Run Configuration Improvements

**Previous (Slow) Configuration:**
```bash
--memory 512Mi
--cpu 1
--max-instances 1
```

**Optimized Configuration:**
```bash
--memory 1Gi
--cpu 2
--max-instances 10
--min-instances 1
--concurrency 80
--execution-environment gen2
```

**Why these changes help:**
- **More Memory (1Gi)**: Prevents container restarts due to memory pressure
- **More CPU (2)**: Faster request processing
- **Min instances (1)**: Eliminates cold starts for the first request
- **Higher concurrency (80)**: More requests per container
- **Gen2 execution**: Better performance and networking

### 3. Nginx Optimizations

**Key improvements in nginx.conf:**
- **Gzip compression**: Reduces transfer size by 60-80%
- **Browser caching**: Static assets cached for 1 year
- **Connection keep-alive**: Reduces connection overhead
- **Buffer optimizations**: Better handling of larger requests

### 4. Mobile-Specific Optimizations

**Touch targets:**
- Minimum 44px touch targets for mobile
- Added `touch-manipulation` CSS for better responsiveness

**Viewport optimizations:**
- Safe area insets for notched devices
- Keyboard-aware layouts
- Momentum scrolling on iOS

**Network optimizations:**
- Retry logic for failed requests
- Connection timeouts
- Exponential backoff

### 5. WebSocket Performance

**Optimizations added:**
```typescript
CONNECTION_RETRY_DELAY: 5000,
HEARTBEAT_INTERVAL: 30000,
RECONNECT_INTERVAL: 10000,
```

### 6. Deployment Steps for Optimal Performance

1. **Build the optimized image:**
```bash
# Clean build
docker buildx build --platform linux/amd64 --no-cache \
  -t asia-south1-docker.pkg.dev/collab-471321/collaba/messaging-app-backend:latest .

# Push to registry
docker push asia-south1-docker.pkg.dev/collab-471321/collaba/messaging-app-backend:latest
```

2. **Deploy with optimized settings:**
```bash
# Use the updated command from gcc.md
gcloud run deploy messaging-app-frontend \
  --image asia-south1-docker.pkg.dev/collab-471321/collaba/messaging-app-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 10 \
  --min-instances 1 \
  --concurrency 80 \
  --timeout 300 \
  --cpu-throttling \
  --execution-environment gen2 \
  --set-env-vars "NODE_ENV=production,GENERATE_SOURCEMAP=false" \
  --set-env-vars "REACT_APP_API_URL=https://collaba-backend-22526857343.us-central1.run.app" \
  --set-env-vars "REACT_APP_WS_URL=wss://collaba-backend-22526857343.us-central1.run.app" \
  --set-env-vars "API_BASE_URL=https://collaba-backend-22526857343.us-central1.run.app" \
  --set-env-vars "WEBSOCKET_URL=wss://collaba-backend-22526857343.us-central1.run.app" \
  --set-env-vars "DISABLE_ESLINT_PLUGIN=true,ESLINT_NO_DEV_ERRORS=true"
```

### 7. Monitoring Performance

**Check deployment status:**
```bash
gcloud run services describe messaging-app-frontend --region=asia-south1
```

**Monitor logs:**
```bash
gcloud logs read --limit=50 --filter="resource.type=cloud_run_revision AND resource.labels.service_name=messaging-app-frontend"
```

**Performance metrics to watch:**
- Cold start latency
- Request latency
- Memory usage
- CPU utilization
- Container startup time

### 8. Additional Optimizations to Consider

**CDN Integration:**
- Use Google Cloud CDN for static assets
- Enable HTTP/2 for better multiplexing

**Database Optimization:**
- Implement connection pooling
- Add database indexes
- Use read replicas for heavy read operations

**Caching Strategy:**
- Redis for session management
- Application-level caching for frequent queries
- Browser cache optimization

## Expected Performance Improvements

After these optimizations, you should see:
- **50-70% faster initial load time**
- **Eliminated cold starts** (with min-instances=1)
- **Better mobile responsiveness**
- **Improved WebSocket stability**
- **Reduced bundle size**

## Troubleshooting

If still experiencing slowness:

1. **Check network latency:**
```bash
curl -w "@curl-format.txt" -o /dev/null -s "https://your-cloud-run-url.com"
```

2. **Monitor Cloud Run metrics** in Google Cloud Console
3. **Test from different locations** to identify regional issues
4. **Profile the app** using Chrome DevTools Performance tab
