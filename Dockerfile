# docker/Dockerfile

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose application port
EXPOSE 3000
