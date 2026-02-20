# Use the official Node.js image as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --silent

# TODO: Removed COPY package-lock.json ./ line
# Copy the source files into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]