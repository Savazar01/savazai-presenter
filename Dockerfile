# Multi-stage Dockerfile for MotionStudio
# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and compile
COPY . .
RUN npm run build

# Stage 2: Production lightweight runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install lightweight static file server
RUN npm install -g sirv-cli

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Expose strictly on port 9090
EXPOSE 9090

ENV NODE_ENV=production
ENV PORT=9090

# Serve static bundle on 0.0.0.0:9090 with CORS and single-page routing
CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "9090", "--single", "--cors"]
