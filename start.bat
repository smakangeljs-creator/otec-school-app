@echo off
cd /d "%~dp0"
echo Starting OTEC School App...

:: Synchronize Dependencies
echo Verifying local dependencies...
call npm install --no-audit --no-fund --prefer-offline

:: Start the development server
echo Starting the application...
call npm run desktop:dev

pause
