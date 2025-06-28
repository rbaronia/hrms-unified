#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Check if node and npm are installed
if ! command -v node > /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm > /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Function to install dependencies
install_dependencies() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        print_status "Installing dependencies in $dir..."
        cd "$dir"
        npm install
        cd - > /dev/null
    fi
}

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"

# Stop any running instances
if [ -f "$ROOT_DIR/scripts/manage-service.sh" ]; then
    print_status "Stopping any running instances..."
    "$ROOT_DIR/scripts/manage-service.sh" stop
fi

# Install dependencies
print_status "Installing dependencies..."
install_dependencies "$ROOT_DIR"
install_dependencies "$CLIENT_DIR"

# Build the client
print_status "Building client..."
cd "$CLIENT_DIR"
npm run build
cd - > /dev/null

# Start the application
print_status "Starting the application..."
"$ROOT_DIR/scripts/manage-service.sh" start

print_status "Build and run completed successfully!"
print_status "The application should now be running at http://localhost:$PORT (where PORT is set in your .env file)"
print_warning "Press Ctrl+C to stop the application"

# Wait for user input
read -p "Press Enter to stop the application..."

# Stop the application
"$ROOT_DIR/scripts/manage-service.sh" stop
