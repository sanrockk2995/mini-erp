# Multi-stage Dockerfile for React Vite Frontend
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Web Server (Nginx)
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Clean default assets
RUN rm -rf ./*

# Copy compiled assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
