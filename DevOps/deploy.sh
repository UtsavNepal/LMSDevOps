#!/bin/bash
set -e

REPO="utsavnepal1"  
TAG="latest"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"  # Absolute path to CompleteLms

echo "Project root: $PROJECT_ROOT"

check_files() {
    echo "Verifying files..."
    [ -f "$PROJECT_ROOT/reactfrontend/package.json" ] || { echo "Frontend package.json missing!"; exit 1; }
    [ -f "$PROJECT_ROOT/LMS/requirements.txt" ] || { echo "Backend requirements.txt missing!"; exit 1; }
    [ -f "$PROJECT_ROOT/DevOps/docker-compose.yml" ] || { echo "docker-compose.yml missing!"; exit 1; }
}

build_service() {
    SERVICE=$1
    DOCKERFILE="$PROJECT_ROOT/DevOps/${SERVICE}.Dockerfile"
    IMG="$REPO/lms-$SERVICE:$TAG"
    
    echo "=== Building $SERVICE ==="
    echo "Dockerfile: $DOCKERFILE"
    echo "Context: $PROJECT_ROOT"
    
    docker build \
        -t "$IMG" \
        -f "$DOCKERFILE" \
        "$PROJECT_ROOT" 
    
    # Push only if previous command succeeded
    docker push "$IMG" || echo "Warning: Push failed for $IMG"
}

# Main execution
check_files

# Build services
build_service "frontend"
build_service "backend"

echo "Starting containers..."
cd "$PROJECT_ROOT/DevOps" && docker-compose up -d --build