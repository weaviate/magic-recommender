#!/bin/bash
set -e

# Start the FastAPI backend on localhost (not exposed publicly)
echo "Starting FastAPI backend..."
uvicorn backend.main:app --host 127.0.0.1 --port 8000 &

# Start the Next.js frontend on the public interface
echo "Starting Next.js frontend..."
cd frontend
npm run start -p $PORT
