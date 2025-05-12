FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies, including dev dependencies needed for build
RUN npm ci --include=dev

# Copy project files
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV NEXT_DISABLE_SSG=true
ENV SKIP_ENV_VALIDATION=true

# Expose port
EXPOSE 3000

# Build and start the application at runtime
# This allows environment variables to be passed via docker-compose
CMD npm run build && npm start
