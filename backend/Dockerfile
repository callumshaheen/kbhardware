
# Dockerfile for KBHardware Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (prefer npm ci, fallback to npm install)
RUN npm ci --only=production || npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose the port (default 4000, can be overridden by env)
EXPOSE 4000

# Start the backend
CMD ["npm", "start"]


