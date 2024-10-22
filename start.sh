# Start the backend using uvicorn, accessible only within the same localhost
echo "Starting backend server..."
uvicorn backend.api:app --host 127.0.0.1 --port 8000 &

# Build and run npm in the frontend
echo "Building and running frontend..."
cd frontend
npm run build
npm start
