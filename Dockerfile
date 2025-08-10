# Use official Node.js base image
FROM node:18-alpine

# Install required tools
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy only package files for layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the backend port
EXPOSE 5050

# Define the command to run your app
CMD ["node", "server.js"]
