# Use the latest official Ubuntu base image
FROM ubuntu:latest

# Set the working directory inside the container
WORKDIR /app

# Update package list and upgrade all packages
RUN apt-get update && apt-get upgrade -y

# Install ffmpeg
RUN apt-get install -y ffmpeg

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code to the working directory
COPY . .

# Install Node.js and npm
RUN apt-get install -y nodejs npm

# Install the application dependencies
RUN npm install

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3003

# Command to run the application with increased memory limit
CMD ["node", "--max-old-space-size=4096", "dist/main"]
