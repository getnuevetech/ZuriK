# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app

# Copy package file
COPY package.json ./

# Install production dependencies
RUN npm install --only=production

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]