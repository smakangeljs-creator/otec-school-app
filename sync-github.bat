@echo off
cd /d "%~dp0"
echo Starting GitHub Synchronization...

:: Check if git is initialized
if not exist ".git\" (
    echo Git repository not found! Initializing...
    git init
    git branch -M main
)

:: Show what changed
echo ======================================
echo COMPARING NEW UPDATES (GIT STATUS):
echo ======================================
git status
echo ======================================

:: Check if there are changes to commit
set HAS_CHANGES=
for /f "tokens=*" %%i in ('git status --porcelain') do set HAS_CHANGES=1

if defined HAS_CHANGES (
    echo Changes detected! Adding changes...
    git add .
    
    :: Commit changes
    for /f "tokens=1-4 delims=/ " %%i in ("%date%") do set "ds=%%k-%%j-%%i"
    for /f "tokens=1-3 delims=/:." %%i in ("%time%") do set "ts=%%i:%%j:%%k"
    git commit -m "Auto-sync backup at %ds% %ts%"
) else (
    echo No local changes to commit.
)

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
