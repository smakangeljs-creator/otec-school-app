#!/bin/bash
cd "$(dirname "$0")"
echo "Starting OTEC School App..."

# Source nvm if it exists
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
fi

# Synchronize Dependencies
echo "Verifying local dependencies..."
npm install --no-audit --no-fund --prefer-offline

# Start the application
echo "Starting the application..."
npm run desktop:dev
