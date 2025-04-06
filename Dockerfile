# Start from Ubuntu:22.04 as the base image
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install Python, Node.js and other dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up backend
WORKDIR /app/backend

# Copy backend requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Set up frontend
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend code
COPY frontend/ .

# Build the React frontend
RUN npm run build

# Set the working directory back to the app root
WORKDIR /app

# Copy any remaining files
COPY . .

# Expose port 8000 as required by the problem statement
EXPOSE 8000

# Command to run the application
CMD ["python3", "backend/app.py"]
