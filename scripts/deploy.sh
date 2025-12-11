#!/bin/bash

# Deployment Script for Event Ticket Booking App

echo "Starting Deployment..."

# Navigate to project directory (Adjust path if necessary)
# cd /path/to/event-ticket-booking 

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Restarting application..."
# Assuming PM2 is used. If another process manager is used, update command accordingly.
pm2 restart all || npm start

echo "Deployment Complete!"
