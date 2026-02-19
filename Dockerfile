# Stage 1: Build the application
FROM node:14 AS builder
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./
RUN npm install

# Copy the source files
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Stage 2: Setup the production image
FROM node:alpine AS production
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]