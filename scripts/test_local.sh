#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building Docker image ---"
docker build -t node-basics-demo .

echo "--- Running tests inside Docker container ---"
# Start the container in detached mode, exposing necessary ports
# Mount the current directory's data for persistence and scripts for reset
docker run --rm \
           -p 3000:3000 \
           -v "$(pwd)/data":/app/data \
           --name node-basics-test-env \
           node-basics-demo npm test

echo "--- Local Docker-based testing complete ---"

