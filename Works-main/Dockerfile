# ================================================
# VAKANS.UZ - Frontend Dockerfile
# Multi-stage build for production
# ================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=/api
ARG VITE_DEMO_MODE=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# Increase memory for build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# ================================================
# Production stage - NGINX
# ================================================
FROM nginx:alpine

# Copy custom nginx config
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
