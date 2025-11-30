@echo off
echo Starting Smart Server Backend...
echo.

REM Check if .env exists
if not exist .env (
    echo .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file and configure MongoDB connection string.
    echo Press any key to continue...
    pause > nul
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
call npm run dev

