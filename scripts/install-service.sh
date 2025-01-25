#!/bin/bash

# This script must be run as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Get the username to run the service
read -p "Enter the username to run the HRMS service: " SERVICE_USER

# Verify the user exists
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
    echo "User $SERVICE_USER does not exist"
    exit 1
fi

# Get the installation directory
INSTALL_DIR="/opt/hrms-unified"

# Create installation directory if it doesn't exist
mkdir -p $INSTALL_DIR

# Copy application files
echo "Copying application files..."
cp -r ../* $INSTALL_DIR/

# Set ownership
chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR

# Update service file with correct user
sed -i "s/<your-user>/$SERVICE_USER/" hrms.service

# Copy service file
cp hrms.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable the service
systemctl enable hrms.service

echo "Installation complete. The service will start automatically on boot."
echo "To start it now, run: systemctl start hrms.service"
echo "To check status, run: systemctl status hrms.service"
