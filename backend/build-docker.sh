#!/bin/bash

# Build script for KararAI Backend Docker Image

echo "Building KararAI Backend Docker Image..."

# Set image name and tag
IMAGE_NAME="kararai-backend"
TAG=${1:-latest}

# Build the Docker image
docker build -t ${IMAGE_NAME}:${TAG} ./backend

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully: ${IMAGE_NAME}:${TAG}"
    
    # Optional: Tag for production
    if [ "$TAG" = "latest" ]; then
        docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:production
        echo "✅ Production tag created: ${IMAGE_NAME}:production"
    fi
    
    # Show image info
    echo "📊 Image details:"
    docker images ${IMAGE_NAME}:${TAG}
else
    echo "❌ Docker build failed!"
    exit 1
fi