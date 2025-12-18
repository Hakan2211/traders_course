# ====================================================================================
# STAGE 1: BUILDER
# Build the TanStack Start application with all dependencies
# ====================================================================================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application (TanStack Start with Nitro outputs to .output/)
RUN npm run build


# ====================================================================================
# STAGE 2: PRODUCTION
# Create a lean production image
# ====================================================================================
FROM node:22-alpine
WORKDIR /app

# Install curl for healthcheck and other utilities
RUN apk add --no-cache curl

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Install tsx for running seed script (needed at runtime)
RUN npm install -g tsx

# Copy the built application from builder stage
COPY --from=builder /app/.output ./.output

# Copy Prisma files (schema and migrations)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy content directories (MDX files needed at runtime)
COPY --from=builder /app/content ./content
COPY --from=builder /app/library ./library

# Copy public assets
COPY --from=builder /app/public ./public

# Copy the entrypoint script
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Generate Prisma client
RUN npx prisma generate

# Create directory for SQLite database
RUN mkdir -p /app/prisma/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/prisma/data/prod.db

EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:3000 || exit 1

# Use entrypoint for migrations/seeding, then start the app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start"]
