# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 mcpuser

# Copy package files and install production dependencies only
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --ignore-scripts --omit=dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/build ./build

# Set ownership
RUN chown -R mcpuser:nodejs /app

# Switch to non-root user
USER mcpuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the HTTP server
CMD ["node", "build/index-http.js"]
