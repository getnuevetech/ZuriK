# Updated Dockerfile to build only the NestJS backend

FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY ./backend ./backend

# Build the NestJS application
RUN npm run build --prefix ./backend

# Start the application
CMD [ "node", "./backend/dist/main.js" ]