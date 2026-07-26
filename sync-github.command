#!/bin/bash
cd "$(dirname "$0")"
echo "Starting GitHub Synchronization..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Git repository not found! Initializing..."
    git init
    git branch -M main
fi

# Add all changes
echo "Adding changes..."
git add .

# Commit changes
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-sync backup at $timestamp"

# Pull remote changes if origin is set
if git remote -v | grep -q 'origin'; then
    echo "Pulling latest changes from remote..."
    git pull origin main --rebase
    
    echo "Pushing changes to remote..."
    git push origin main
else
    echo "No remote 'origin' found. Please add one using:"
    echo "git remote add origin <your-github-repo-url>"
fi

echo "GitHub Synchronization Complete!"
