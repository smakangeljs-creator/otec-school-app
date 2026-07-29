@echo off
echo ========================================================
echo       OTEC School Management System - Auto Installer      
echo ========================================================
echo.

set TARGET_DIR=School Management System

if not exist "%TARGET_DIR%" (
  echo [1/4] Creating folder "%TARGET_DIR%"...
  mkdir "%TARGET_DIR%"
) else (
  echo [1/4] Folder "%TARGET_DIR%" already exists.
)

cd "%TARGET_DIR%"

if not exist ".git" (
  echo [2/4] Downloading latest system files from GitHub...
  git clone https://github.com/smakangeljs-creator/otec-school-app.git .
) else (
  echo [2/4] System files already downloaded. Pulling latest updates...
  git pull origin main
)

echo.
echo [3/4] Installing necessary dependencies (this may take a few minutes)...
call npm install

echo.
echo [4/4] Everything is ready! Starting the server...
echo.
echo IMPORTANT: Once the server starts, you can access it on this machine at:
echo http://localhost:5000
echo Or on your phone/other computers by checking the "Network" IP shown below.
echo.

call npm run dev -- --host
