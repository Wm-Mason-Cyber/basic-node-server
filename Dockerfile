# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
# to leverage Docker cache
COPY package*.json ./

# Install app dependencies
# Use npm ci for clean installs in CI/CD environments
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]