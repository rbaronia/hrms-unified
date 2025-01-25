#!/bin/bash

# Get the server port from config.properties
get_port() {
    local port=$(grep "^server.port=" config.properties | cut -d'=' -f2)
    echo ${port:-3000}  # Default to 3000 if not found
}

# Check if node_modules exists and is up to date
check_node_modules() {
    local dir=$1
    local package_json="$dir/package.json"
    local node_modules="$dir/node_modules"
    
    if [ ! -d "$node_modules" ]; then
        return 1
    fi
    
    if [ "$package_json" -nt "$node_modules" ]; then
        return 1
    fi
    
    return 0
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
    if [ ! -d "client/build" ] || [ "client/src" -nt "client/build" ]; then
        echo "Client needs to be built..."
        cd client
        
        echo "📦 Checking frontend dependencies..."
        if ! check_node_modules "."; then
            echo "Installing frontend dependencies..."
            npm install --no-audit --no-fund
        else
            echo "Frontend dependencies are up to date"
        fi
        
        echo "🏗️  Building frontend..."
        DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false npm run build
        if [ $? -ne 0 ]; then
            echo "❌ Client build failed"
            exit 1
        fi
        echo "✅ Frontend built successfully"
        cd ..
    else
        echo "✅ Client build is up to date"
    fi
}

# Build the application
build_app() {
    # First check backend dependencies
    echo "📦 Checking backend dependencies..."
    if ! check_node_modules "."; then
        echo "Installing backend dependencies..."
        npm install --no-audit --no-fund
    else
        echo "Backend dependencies are up to date"
    fi

    # Then build frontend
    echo "🏗️  Building frontend..."
    cd client
    if ! check_node_modules "."; then
        echo "Installing frontend dependencies..."
        npm install --no-audit --no-fund
    else
        echo "Frontend dependencies are up to date"
    fi
    
    echo "Building frontend application..."
    DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
    cd ..

    echo "✅ Build completed successfully"
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

    echo "🚀 Starting service..."
    if [ "$1" == "dev" ]; then
        NODE_ENV=development npm run dev
    else
        NODE_ENV=production npm start
    fi
}

# Show status
show_status() {
    local port=$(get_port)
    if check_service; then
        local pid=$(lsof -t -i:$port)
        echo "✅ Service is running on port $port (PID: $pid)"
    else
        echo "❌ Service is not running"
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
