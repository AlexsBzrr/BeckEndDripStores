# Use a Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Build the application (if necessary, e.g., for TypeScript projects)
# RUN npm run build

# Use a lightweight Alpine Linux base image for the production environment
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app .

# Accept build arguments for environment variables
ARG NODE_ENV
ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME

# Optionally set them as environment variables for build-time use
ENV NODE_ENV=$NODE_ENV \
    DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_USER=$DB_USER \
    DB_PASSWORD=$DB_PASSWORD \
    DB_NAME=$DB_NAME

# Expose the port the app runs on
EXPOSE 3300

# Command to run the application
CMD [ "node", "src/server.js" ]
