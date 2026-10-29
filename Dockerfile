# ===================================================
# SketchTrace AI — Production Multi-Stage Dockerfile
# ===================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Build Backend & Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DEFAULT_AI_PROVIDER=pollinations

# Install production dependencies for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy backend source & compile
COPY server/ ./
RUN npx tsc

# Copy built frontend assets from Stage 1 into client/dist
WORKDIR /app
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure data directory permissions
RUN mkdir -p /app/server/data

WORKDIR /app/server
EXPOSE 5000

CMD ["node", "dist/index.js"]
