# syntax=docker/dockerfile:1

# -----------------------------
# Stage 1: Build the React app
# -----------------------------
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .

# URL del API: se pasa como build-arg desde docker-compose.
# Las variables de entorno tienen prioridad sobre el archivo .env de CRA,
# así el mismo Dockerfile sirve para local (localhost) y producción (dominio).
ARG REACT_APP_API_URL=http://localhost:3000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build


# -----------------------------
# Stage 2: Serve static files
# -----------------------------
FROM node:18-alpine

# Install a simple static server
RUN npm install -g serve@14.2.0

# Set working directory
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/build ./build

# Expose port to the outside
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "build", "-l", "3000"]
