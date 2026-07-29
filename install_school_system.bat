@echo off
setlocal
echo ========================================================
echo       OTEC School Management System - Auto Installer      
echo ========================================================
echo.

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed! Please download and install Git from https://git-scm.com/
    pause
    exit /b
)

:: Check if Node is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/NPM is not installed! Please download and install Node.js from https://nodejs.org/
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
