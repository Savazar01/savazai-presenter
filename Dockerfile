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

# Copy compiled assets and hardened static server from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/server.mjs ./server.mjs

USER node

# Expose strictly on port 9090
EXPOSE 9090

ENV NODE_ENV=production
ENV PORT=9090

# Serve static bundle on 0.0.0.0:9090 with hardened security headers
CMD ["node", "server.mjs"]
