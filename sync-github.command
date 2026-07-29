#!/bin/bash
cd "$(dirname "$0")"
echo "Starting GitHub Synchronization..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Git repository not found! Initializing..."
    git init
    git branch -M main
fi

# Show what changed
echo "======================================"
echo "COMPARING NEW UPDATES (GIT STATUS):"
echo "======================================"
git status
echo "======================================"

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "Changes detected! Adding changes..."
    git add .
    timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    git commit -m "Auto-sync backup at $timestamp"
else
    echo "No local changes to commit."
fi

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
