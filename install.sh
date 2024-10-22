#!/bin/bash

# Navigate to the backend directory and install Python requirements
echo "Installing backend requirements..."
cd backend
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "requirements.txt not found in backend directory."
    exit 1
fi

# Navigate to the frontend directory and install npm packages
echo "Installing frontend dependencies..."
cd ../frontend
if [ -f "package.json" ]; then
    npm install
else
    echo "package.json not found in frontend directory."
    exit 1
fi

echo "Installation completed successfully."
