#!/bin/bash

# Get the server port from config.properties
get_port() {
    local port=$(grep "^server.port=" config.properties | cut -d'=' -f2)
    echo ${port:-3000}  # Default to 3000 if not found
}

# Check if the service is running
check_service() {
    local port=$(get_port)
    if lsof -i :$port > /dev/null; then
        return 0  # Service is running
    else
        return 1  # Service is not running
    fi
}

# Stop the service
stop_service() {
    local port=$(get_port)
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Stopping service on port $port (PID: $pid)..."
        kill $pid
        sleep 2
        if check_service; then
            echo "Service didn't stop gracefully, forcing..."
            kill -9 $pid
        fi
        echo "Service stopped"
    else
        echo "No service running on port $port"
    fi
}

# Ensure client is built
ensure_client_build() {
    if [ ! -d "client/build" ]; then
        echo "Client build directory not found. Building client..."
        cd client
        npm install
        npm run build
        if [ $? -ne 0 ]; then
            echo "Client build failed"
            exit 1
        fi
        cd ..
    fi
}

# Build the application
build_app() {
    echo "Building frontend..."
    cd client
    npm install
    npm run build
    if [ $? -ne 0 ]; then
        echo "Frontend build failed"
        exit 1
    fi
    cd ..

    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Backend dependency installation failed"
        exit 1
    fi

    echo "Build completed successfully"
}

# Start the service
start_service() {
    local port=$(get_port)
    if check_service; then
        echo "Service is already running on port $port"
        return 1
    fi

    # Always ensure client is built before starting
    ensure_client_build

    echo "Starting service..."
    if [ "$1" == "dev" ]; then
        npm run dev
    else
        npm start
    fi
}

# Show status
show_status() {
    local port=$(get_port)
    if check_service; then
        local pid=$(lsof -t -i:$port)
        echo "Service is running on port $port (PID: $pid)"
    else
        echo "Service is not running"
    fi
}

# Main script
case "$1" in
    "build")
        build_app
        ;;
    "start")
        start_service
        ;;
    "start-dev")
        start_service "dev"
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        stop_service
        start_service
        ;;
    "restart-dev")
        stop_service
        start_service "dev"
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {build|start|start-dev|stop|restart|restart-dev|status}"
        exit 1
        ;;
esac
