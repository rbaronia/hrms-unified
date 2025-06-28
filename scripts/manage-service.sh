#!/bin/bash

# Configuration
APP_NAME="hrms"
APP_DIR="/opt/hrms-unified"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"
ENV_FILE="$APP_DIR/.env"

# Load environment variables if exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Do not set PORT or CORS_ORIGIN here; they must come from .env
NODE_ENV=${NODE_ENV:-production}

# Helper function to check if running as root
check_root() {
    if [ "$(id -u)" != "0" ]; then
        echo "This script must be run as root" 1>&2
        exit 1
    fi
}

# Check if the service is running
check_service() {
    if systemctl is-active --quiet $APP_NAME; then
        return 0  # Service is running
    else
        return 1  # Service is not running
    fi
}

# Install dependencies and build the application
build_app() {
    echo "Building application..."
    
    # Install server dependencies
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "Installing server dependencies..."
        npm install
    fi
    
    # Build client
    cd client
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "Installing client dependencies..."
        npm install
    fi
    
    echo "Building client..."
    npm run build
    cd ..
    
    # Create default .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating default .env..."
        cat > .env << EOL
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hrmsuser
DB_PASSWORD=your_secure_password
DB_NAME=hrmsdb

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
EOL
    fi
    
    echo "Build complete"
}

# Install the service
install_service() {
    check_root
    
    echo "Installing $APP_NAME service..."
    
    # Create system user if it doesn't exist
    if ! id -u "$APP_NAME" >/dev/null 2>&1; then
        useradd -r -s /bin/false "$APP_NAME"
    fi
    
    # Create service directory
    mkdir -p "$APP_DIR"
    
    # Copy application files
    cp -r . "$APP_DIR"
    
    # Set permissions
    chown -R $APP_NAME:$APP_NAME "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    
    # Create service file
    cat > "$SERVICE_FILE" << EOL
[Unit]
Description=HRMS Application
After=network.target mysqld.service

[Service]
Type=simple
User=$APP_NAME
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=$NODE_ENV
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOL
    
    # Reload systemd
    systemctl daemon-reload
    
    echo "Service installed successfully"
}

# Start the service
start_service() {
    check_root
    
    if check_service; then
        echo "Service is already running"
    else
        echo "Starting service..."
        systemctl start $APP_NAME
        
        # Wait for service to start
        sleep 2
        if check_service; then
            echo "Service started successfully"
        else
            echo "Failed to start service. Check logs with: journalctl -u $APP_NAME -f"
            exit 1
        fi
    fi
}

# Stop the service
stop_service() {
    check_root
    
    if check_service; then
        echo "Stopping service..."
        systemctl stop $APP_NAME
        
        # Wait for service to stop
        sleep 2
        if ! check_service; then
            echo "Service stopped successfully"
        else
            echo "Failed to stop service. Check logs with: journalctl -u $APP_NAME -f"
            exit 1
        fi
    else
        echo "Service is not running"
    fi
}

# Restart the service
restart_service() {
    check_root
    
    echo "Restarting service..."
    systemctl restart $APP_NAME
    
    # Wait for service to restart
    sleep 2
    if check_service; then
        echo "Service restarted successfully"
    else
        echo "Failed to restart service. Check logs with: journalctl -u $APP_NAME -f"
        exit 1
    fi
}

# Show service status
show_status() {
    systemctl status $APP_NAME
}

# Main script
case "$1" in
    "build")
        build_app
        ;;
    "install")
        install_service
        ;;
    "start")
        start_service
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        restart_service
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {build|install|start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0
