#!/bin/bash

# This script must be run as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Get the username to run the service
read -p "Enter the username to run the HRMS service [ibmdemo]: " SERVICE_USER
SERVICE_USER=${SERVICE_USER:-ibmdemo}

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

# Set ownership
chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR

# Update service file with correct user and path
sed -i "s/<your-user>/$SERVICE_USER/" hrms.service
sed -i "s|/opt/hrms-unified|$INSTALL_DIR|" hrms.service

# Copy service file
cp hrms.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable the service
systemctl enable hrms.service

echo "Installation complete. The service will start automatically on boot."
echo "To start it now, run: systemctl start hrms.service"
echo "To check status, run: systemctl status hrms.service"
