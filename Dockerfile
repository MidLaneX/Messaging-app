# Use the official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies with production optimizations
# Use --no-frozen-lockfile to handle updated dependencies
RUN pnpm install --no-frozen-lockfile --production=false

# Copy the rest of the application code (excluding unwanted files)
COPY src/ src/
COPY public/ public/
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copy environment file for production
COPY .env.production .env

# Build the application with optimizations
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
RUN pnpm run build

# Production stage - use nginx:alpine with performance optimizations
FROM nginx:1.24-alpine AS production

# Install additional packages for better performance
RUN apk add --no-cache \
    ca-certificates \
    curl \
    && rm -rf /var/cache/apk/*

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx with optimized configuration (run as root for port 80)
CMD ["nginx", "-g", "daemon off;"]
