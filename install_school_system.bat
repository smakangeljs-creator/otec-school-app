@echo off
setlocal
echo ========================================================
echo       OTEC School Management System - Auto Installer      
echo ========================================================
echo.

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Git is missing! Installing Git automatically in the background...
    winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements --silent
    echo [INFO] Git installed.
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
)

:: Check if Node is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js and NPM are missing! Installing Node.js automatically in the background...
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements --silent
    echo [INFO] Node.js installed.
    set "PATH=%PATH%;C:\Program Files\nodejs"
)

:: Final sanity check
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git installation failed or PATH not updated. Please install it manually from https://git-scm.com/
    pause
    exit /b
)

set TARGET_DIR=School Management System

if not exist "%TARGET_DIR%" (
  echo [1/4] Downloading system files from GitHub...
  git clone https://github.com/smakangeljs-creator/otec-school-app.git "%TARGET_DIR%"
) else (
  echo [1/4] Folder "%TARGET_DIR%" already exists.
)

cd "%TARGET_DIR%"

if exist ".git" (
  echo [2/4] Syncing latest updates...
  git fetch origin
  git reset --hard origin/main
) else (
  echo [2/4] Directory is not a git repository. Skipping sync.
)

echo.
echo [3/4] Installing necessary dependencies (this may take a few minutes)...
call npm install --force

echo.
echo [4/4] Everything is ready! Starting the server and opening the application...
echo.
echo The application should automatically launch in a few seconds...
echo.

:: Start the application
call npm run desktop:dev

:: If it crashes, pause so the user can read the error!
echo.
echo [ERROR] The application stopped unexpectedly.
pause
