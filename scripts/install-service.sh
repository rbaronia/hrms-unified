#!/bin/bash

# This script must be run as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Get the username to run the service
read -p "Enter the username to run the HRMS service [$(whoami)]: " SERVICE_USER
SERVICE_USER=${SERVICE_USER:-$(whoami)}

# Verify the user exists
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
    echo "User $SERVICE_USER does not exist"
    exit 1
fi

# Get the home directory
HOME_DIR=$(eval echo "~$SERVICE_USER")
INSTALL_DIR="$HOME_DIR/hrms-unified"

# Verify installation directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Error: $INSTALL_DIR does not exist"
    echo "Please clone the repository first:"
    echo "git clone https://github.com/rbaronia/hrms-unified.git ~/hrms-unified"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "Error: Node.js and npm are required but not installed"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
cd "$INSTALL_DIR"
sudo -u "$SERVICE_USER" npm install
sudo -u "$SERVICE_USER" cd client && npm install
cd -

# Build the client
echo "Building client..."
cd "$INSTALL_DIR/client"
sudo -u "$SERVICE_USER" npm run build
cd -

# Set ownership
chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR

# Ensure .env exists in the install directory
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo ".env file not found, copying from .env.example"
    cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
fi

# Update service file with correct user and path
sed -i "s/<your-user>/$SERVICE_USER/g" hrms.service
sed -i "s|/opt/hrms-unified|$INSTALL_DIR|" hrms.service
# EnvironmentFile is already set in hrms.service to load PORT and other variables from .env

# Copy service file
cp hrms.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable the service
systemctl enable hrms.service

echo "Installation complete!"
echo "To start the service now, run: systemctl start hrms.service"
echo "To check status, run: systemctl status hrms.service"
echo "To view logs, run: journalctl -u hrms.service -f"
