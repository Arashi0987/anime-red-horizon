FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies (only once — rest is volume-mounted)
COPY package*.json ./
RUN npm install

# Install backend dependencies if needed
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install || true

# Go back to root app folder
WORKDIR /app

# Start script is handled by docker-compose (frontend and backend separately)
