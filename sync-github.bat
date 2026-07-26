@echo off
cd /d "%~dp0"
echo Starting GitHub Synchronization...

:: Check if git is initialized
if not exist ".git\" (
    echo Git repository not found! Initializing...
    git init
    git branch -M main
)

:: Add all changes
echo Adding changes...
git add .

:: Commit changes
for /f "tokens=1-4 delims=/ " %%i in ("%date%") do set "ds=%%k-%%j-%%i"
for /f "tokens=1-3 delims=/:." %%i in ("%time%") do set "ts=%%i:%%j:%%k"
git commit -m "Auto-sync backup at %ds% %ts%"

:: Pull remote changes if origin is set
git remote -v | find "origin" > nul
if errorlevel 1 (
    echo No remote 'origin' found. Please add one using:
    echo git remote add origin ^<your-github-repo-url^>
) else (
    echo Pulling latest changes from remote...
    git pull origin main --rebase
    
    echo Pushing changes to remote...
    git push origin main
)

echo GitHub Synchronization Complete!
pause
