# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# The build context is the project root, so we must specify the 'App' sub-directory for these commands.
COPY App/package*.json ./
RUN npm ci --silent

# Copy the rest of the frontend source code
COPY App/ ./

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration from the project root (the build context)
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories for nginx to work properly
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chmod 777 /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx"]