# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install ALL dependencies (including devDependencies needed by nest build)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and config files needed for nest build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Production ────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
