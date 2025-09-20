@echo off
echo Starting Multilingual AI Chatbot...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if requirements are installed
python -c "import whisper, googletrans, gtts, sounddevice, pygame" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    python setup.py
    if errorlevel 1 (
        echo Setup failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

REM Start the chatbot
echo Starting chatbot...
python run_chatbot.py

pause
