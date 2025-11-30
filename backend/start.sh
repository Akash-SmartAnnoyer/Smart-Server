#!/bin/bash

echo "Starting Smart Server Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo ".env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "Please edit .env file and configure MongoDB connection string."
    read -p "Press enter to continue..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server..."
echo ""
npm run dev

