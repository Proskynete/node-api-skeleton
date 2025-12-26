# Multi-stage Dockerfile for Node API Skeleton
# Supports both development and production environments

# Stage 1: Base - Common dependencies
FROM node:24-alpine AS base

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Stage 2: Dependencies - Install all dependencies
FROM base AS dependencies

# Install ALL dependencies (including dev dependencies)
# Skip postinstall scripts (husky) during Docker build
RUN npm ci --ignore-scripts

# Stage 3: Development - For local development with hot reload
FROM dependencies AS development

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# Stage 4: Builder - Build the application
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the application using SWC
RUN npm run build

# Stage 5: Production - Minimal production image
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install only production dependencies
# Skip postinstall scripts (husky) during Docker build
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
