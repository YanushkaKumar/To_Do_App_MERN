# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies for the backend
RUN npm ci --only=production

# Copy the backend source code into the container
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose the port your app runs on
EXPOSE 5050

# Define the command to run your app
CMD ["node", "server.js"]