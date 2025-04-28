# Use an official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app (assuming it's a React app or similar)
RUN npm run build

# Serve the app using a lightweight web server
# Install serve globally
RUN npm install -g serve

# Expose port (default for serve is 3000 or 5000)
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
