# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Install system dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy dependencies first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 5001

# Start the application
CMD ["sh", "-c", "npx prisma db push && npm start"]
