# Use Node.js 20 as a base image
FROM node:20

# Install system dependencies
RUN apt-get update && apt-get install -y libatomic1 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install ALL dependencies including devDependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Prune devDependencies for production (keep only runtime deps)
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable for the port Railway uses
ENV PORT=3000

# Start the standalone server directly
CMD [ "node", ".next/standalone/server.js" ]
