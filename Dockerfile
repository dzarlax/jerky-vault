# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy project files
COPY . .

# Build arguments with defaults
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG MAPBOX_ACCESS_TOKEN=

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_DISABLE_SSG=true
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV MAPBOX_ACCESS_TOKEN=$MAPBOX_ACCESS_TOKEN

# Build the application
RUN npm run build:no-ssg

# Stage 2: Production runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/locales ./locales
COPY --from=builder /app/i18n.cjs ./i18n.cjs
COPY --from=builder /app/i18n.json ./i18n.json
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy entrypoint script
COPY entrypoint.sh ./entrypoint.sh
# Ensure LF line endings (Windows CRLF fix)
RUN sed -i 's/\r$//' entrypoint.sh || true
RUN chmod +x entrypoint.sh

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run entrypoint script
CMD ["./entrypoint.sh"]
