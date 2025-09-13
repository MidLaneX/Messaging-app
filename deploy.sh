#!/bin/bash

# Optimized deployment script for Google Cloud Run
# This script builds and deploys the messaging app with performance optimizations

set -e

echo "🚀 Starting optimized deployment to Google Cloud Run..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="collab-471321"
REGION="asia-south1"
SERVICE_NAME="messaging-app-frontend"
IMAGE_NAME="asia-south1-docker.pkg.dev/${PROJECT_ID}/collaba/messaging-app-backend:latest"

echo -e "${YELLOW}📦 Building optimized Docker image...${NC}"

# Clean build with platform specification
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  -t ${IMAGE_NAME} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker build completed successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Pushing image to Google Container Registry...${NC}"

# Push to registry
docker push ${IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image pushed successfully${NC}"
else
    echo -e "${RED}❌ Image push failed${NC}"
    exit 1
fi

echo -e "${YELLOW}☁️ Deploying to Cloud Run with optimized settings...${NC}"

# Deploy with optimized configuration
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
    echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
    
    # Display deployment info
    echo -e "${YELLOW}📊 Deployment Summary:${NC}"
    gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='table(
        metadata.name,
        status.url,
        spec.template.spec.containers[0].resources.limits.memory,
        spec.template.spec.containers[0].resources.limits.cpu,
        spec.template.metadata.annotations."autoscaling.knative.dev/maxScale",
        spec.template.metadata.annotations."autoscaling.knative.dev/minScale"
    )'
    
    echo -e "${GREEN}🎉 Deployment complete! Your app should now be much faster.${NC}"
    echo -e "${YELLOW}💡 Pro tip: Test the app on mobile to see the performance improvements!${NC}"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📈 To monitor performance:${NC}"
echo "gcloud run services describe ${SERVICE_NAME} --region=${REGION}"
echo "gcloud logs read --limit=50 --filter=\"resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}\""
