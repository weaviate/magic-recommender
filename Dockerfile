# Use an official Python runtime as a base image
FROM python:3.11

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/

# Copy frontend files
COPY frontend/ ./frontend/

# Install backend dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install frontend dependencies and build
RUN cd frontend && \
    npm install && \
    npm run build

# Expose the port (Render uses PORT environment variable)
ENV PORT=10000

# Copy the start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Start both servers
CMD ["/start.sh"]
