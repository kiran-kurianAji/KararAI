@echo off
REM Build script for KararAI Backend Docker Image (Windows)

echo Building KararAI Backend Docker Image...

REM Set image name and tag
set IMAGE_NAME=kararai-backend
set TAG=%1
if "%TAG%"=="" set TAG=latest

REM Build the Docker image
docker build -t %IMAGE_NAME%:%TAG% ./backend

if %ERRORLEVEL% equ 0 (
    echo ✅ Docker image built successfully: %IMAGE_NAME%:%TAG%
    
    REM Optional: Tag for production
    if "%TAG%"=="latest" (
        docker tag %IMAGE_NAME%:%TAG% %IMAGE_NAME%:production
        echo ✅ Production tag created: %IMAGE_NAME%:production
    )
    
    REM Show image info
    echo 📊 Image details:
    docker images %IMAGE_NAME%:%TAG%
) else (
    echo ❌ Docker build failed!
    exit /b 1
)