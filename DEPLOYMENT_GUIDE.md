# HRMS Application - Complete Deployment Guide

Comprehensive guide for deploying and running the HRMS application on RHEL (Red Hat Enterprise Linux) with systemd auto-restart on reboot.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [RHEL Production Deployment](#rhel-production-deployment)
6. [Systemd Service Configuration](#systemd-service-configuration)
7. [Service Management](#service-management)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 🎯 Overview

The HRMS (Human Resource Management System) is a full-stack application built with:
- **Backend**: Node.js, Express, MySQL
- **Frontend**: React, TypeScript, Material-UI
- **Database**: Remote MySQL 8+

### Key Features
- User Management with CRUD operations
- Department Hierarchy Management
- User Types Management
- Dashboard with real-time statistics
- Manager Assignment (unique selection)
- Responsive Material-UI interface
- Global notification system

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v16+ (v18 recommended for RHEL 8/9)
- **npm**: v8+
- **MySQL**: v8+ (remote database)
- **Git**: For cloning repository
- **RHEL**: 8 or 9 (or compatible: CentOS Stream, Rocky Linux, AlmaLinux)

### System Requirements
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk**: Minimum 2GB free space
- **Network**: Access to remote MySQL database
- **Ports**: 4000 (or custom PORT from .env)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v16+

# Check npm version
npm --version   # Should be v8+

# Check RHEL version
cat /etc/redhat-release

# Check available memory
free -h

# Check disk space
df -h
```

---

## 🚀 Quick Start

For development or testing (3 simple steps):

```bash
# 1. Install dependencies
npm run install-all

# 2. Build frontend
cd client && npm run build && cd ..

# 3. Start application
npm start
```

Access at: **http://localhost:4000** (or your configured PORT)

---

## 📝 Detailed Setup

### Step 1: Install Node.js on RHEL

```bash
# For RHEL 8/9 - Install Node.js 18 LTS
sudo dnf module enable nodejs:18
sudo dnf install nodejs npm -y

# Verify installation
node --version
npm --version
```

### Step 2: Clone Repository

```bash
# Clone to home directory
cd ~
git clone https://github.com/yourusername/hrms-unified.git
cd hrms-unified

# Or clone to /opt for production
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/yourusername/hrms-unified.git
sudo chown -R $USER:$USER hrms-unified
cd hrms-unified
```

### Step 3: Configure Environment

Create `.env` file in the project root:

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

**Required .env Configuration:**

```properties
# Database Configuration (REQUIRED)
DB_HOST=your-remote-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=hrmsdb
DB_SSL=false

# Server Configuration
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=your_secure_jwt_secret_key_here
CORS_ORIGIN=http://your-server-hostname:4000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/hrms.log
```

**Important Notes:**
- Replace all placeholder values with actual credentials
- Use strong JWT_SECRET (minimum 32 characters)
- Set CORS_ORIGIN to your server's hostname/IP
- Ensure remote database allows connections from your RHEL server IP

### Step 4: Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install-all

# This installs:
# - Backend: ~575 packages
# - Frontend: ~1546 packages
```

### Step 5: Build Frontend

```bash
cd client
npm run build
cd ..

# Verify build
ls -la client/build/
```

### Step 6: Test Application

```bash
# Test database connection
npm run test-db

# Start in development mode (for testing)
npm run dev

# Or start in production mode
npm start
```

Access at: **http://localhost:4000**

---

## 🏢 RHEL Production Deployment

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         RHEL Server (systemd)           │
│  ┌───────────────────────────────────┐  │
│  │   HRMS Application (Node.js)      │  │
│  │   - Express Backend (Port 4000)   │  │
│  │   - React Frontend (Static)       │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │   systemd Service Manager         │  │
│  │   - Auto-start on boot            │  │
│  │   - Auto-restart on failure       │  │
│  │   - Log management (journald)     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │  Remote MySQL DB    │
    │  (External Server)  │
    └─────────────────────┘
```

### Deployment Steps

#### 1. Prepare Production Environment

```bash
# Create application directory
sudo mkdir -p /opt/hrms-unified
cd /opt/hrms-unified

# Clone or copy application
sudo git clone https://github.com/yourusername/hrms-unified.git .

# Create dedicated user (recommended)
sudo useradd -r -s /bin/bash -d /opt/hrms-unified hrmsapp

# Set ownership
sudo chown -R hrmsapp:hrmsapp /opt/hrms-unified
```

#### 2. Configure Firewall

```bash
# Allow application port (default 4000)
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

#### 3. Configure SELinux (if enabled)

```bash
# Check SELinux status
getenforce

# If enforcing, allow Node.js to bind to port
sudo semanage port -a -t http_port_t -p tcp 4000

# Or temporarily set to permissive for testing
sudo setenforce 0
```

---

## ⚙️ Systemd Service Configuration

### Understanding the Service File

The systemd service file (`scripts/hrms.service`) provides:
- **Auto-start on boot**: Service starts automatically when RHEL boots
- **Auto-restart on failure**: Service restarts if it crashes
- **Dependency management**: Waits for network and MySQL
- **Environment management**: Loads variables from .env
- **Log management**: Integrates with journald

### Service File Template

Located at `scripts/hrms.service`:

```ini
[Unit]
Description=HRMS Application Service
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=hrmsapp
WorkingDirectory=/opt/hrms-unified
EnvironmentFile=/opt/hrms-unified/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hrms-app
Environment=NODE_ENV=production
Environment=NODE_OPTIONS=--openssl-legacy-provider

[Install]
WantedBy=multi-user.target
```

### Installation Methods

#### Method 1: Automated Installation (Recommended)

```bash
# Navigate to project directory
cd /opt/hrms-unified

# Run installation script as root
sudo ./scripts/install-service.sh

# Follow prompts to enter username
# Script will:
# - Install dependencies
# - Build frontend
# - Configure service file
# - Enable service
# - Set permissions
```

#### Method 2: Manual Installation

```bash
# 1. Edit service file with your details
cd /opt/hrms-unified/scripts
sudo nano hrms.service

# Replace:
# - <your-user> with actual username (e.g., hrmsapp)
# - /home/<your-user>/hrms-unified with actual path (e.g., /opt/hrms-unified)

# 2. Copy service file to systemd
sudo cp hrms.service /etc/systemd/system/

# 3. Reload systemd daemon
sudo systemctl daemon-reload

# 4. Enable service (auto-start on boot)
sudo systemctl enable hrms.service

# 5. Start service
sudo systemctl start hrms.service
```

### Service Configuration Options

**Key Parameters:**

- `User`: Unix user to run the service (e.g., hrmsapp)
- `WorkingDirectory`: Full path to application directory
- `EnvironmentFile`: Path to .env file (loads PORT, DB credentials, etc.)
- `Restart=always`: Always restart on failure
- `RestartSec=10`: Wait 10 seconds before restart
- `After=network.target`: Start after network is available
- `WantedBy=multi-user.target`: Enable for multi-user runlevel

---

## 🎮 Service Management

### Basic Commands

```bash
# Start service
sudo systemctl start hrms.service

# Stop service
sudo systemctl stop hrms.service

# Restart service
sudo systemctl restart hrms.service

# Check status
sudo systemctl status hrms.service

# Enable auto-start on boot
sudo systemctl enable hrms.service

# Disable auto-start on boot
sudo systemctl disable hrms.service

# Check if enabled
sudo systemctl is-enabled hrms.service

# Check if running
sudo systemctl is-active hrms.service
```

### View Logs

```bash
# View recent logs
sudo journalctl -u hrms.service

# Follow logs in real-time
sudo journalctl -u hrms.service -f

# View logs since boot
sudo journalctl -u hrms.service -b

# View last 100 lines
sudo journalctl -u hrms.service -n 100

# View logs with timestamps
sudo journalctl -u hrms.service -o short-precise

# View logs for specific date
sudo journalctl -u hrms.service --since "2024-01-01" --until "2024-01-02"
```

### Using Management Script

The `scripts/manage-service.sh` provides convenient commands:

```bash
# Build application
sudo ./scripts/manage-service.sh build

# Install service
sudo ./scripts/manage-service.sh install

# Start service
sudo ./scripts/manage-service.sh start

# Stop service
sudo ./scripts/manage-service.sh stop

# Restart service
sudo ./scripts/manage-service.sh restart

# Check status
sudo ./scripts/manage-service.sh status
```

---

## ✅ Verification & Testing

### 1. Verify Service Status

```bash
# Check if service is running
sudo systemctl status hrms.service

# Expected output:
# ● hrms.service - HRMS Application Service
#    Loaded: loaded (/etc/systemd/system/hrms.service; enabled; vendor preset: disabled)
#    Active: active (running) since ...
```

### 2. Test Database Connection

```bash
# From application directory
cd /opt/hrms-unified
npm run test-db

# Expected: "Database connection successful"
```

### 3. Test API Endpoints

```bash
# Test users endpoint
curl http://localhost:4000/api/users

# Test dashboard stats
curl http://localhost:4000/api/dashboard/stats

# Test departments
curl http://localhost:4000/api/departments

# Test health check (if implemented)
curl http://localhost:4000/health
```

### 4. Test Frontend

```bash
# Using curl
curl http://localhost:4000

# Should return HTML content

# Or open in browser
firefox http://localhost:4000
# or
curl -I http://localhost:4000
```

### 5. Test Auto-Restart

```bash
# Kill the Node.js process
sudo pkill -f "node.*server.js"

# Wait 10 seconds (RestartSec)
sleep 10

# Check if service restarted
sudo systemctl status hrms.service

# Should show "active (running)"
```

### 6. Test Auto-Start on Boot

```bash
# Reboot the server
sudo reboot

# After reboot, check service status
sudo systemctl status hrms.service

# Should be "active (running)"
```

### 7. Verify Port Listening

```bash
# Check if application is listening on port
sudo ss -tlnp | grep 4000

# Or
sudo netstat -tlnp | grep 4000

# Expected output shows Node.js listening on port 4000
```

### Complete Verification Checklist

- [ ] Service is enabled: `sudo systemctl is-enabled hrms.service`
- [ ] Service is running: `sudo systemctl is-active hrms.service`
- [ ] Database connection works: `npm run test-db`
- [ ] API endpoints respond: `curl http://localhost:4000/api/users`
- [ ] Frontend loads: `curl http://localhost:4000`
- [ ] Port is listening: `sudo ss -tlnp | grep 4000`
- [ ] Logs are clean: `sudo journalctl -u hrms.service -n 50`
- [ ] Auto-restart works: Kill process and verify restart
- [ ] Auto-start works: Reboot and verify service starts

---

## 🐛 Troubleshooting

### Service Won't Start

**Check logs:**
```bash
sudo journalctl -u hrms.service -n 100 --no-pager
```

**Common issues:**

1. **Permission denied**
   ```bash
   # Fix ownership
   sudo chown -R hrmsapp:hrmsapp /opt/hrms-unified
   
   # Fix permissions
   sudo chmod -R 755 /opt/hrms-unified
   ```

2. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :4000
   
   # Kill process
   sudo kill -9 <PID>
   
   # Or change PORT in .env
   ```

3. **Module not found**
   ```bash
   # Reinstall dependencies
   cd /opt/hrms-unified
   sudo -u hrmsapp npm install
   sudo -u hrmsapp bash -c "cd client && npm install"
   ```

4. **Database connection failed**
   ```bash
   # Verify .env credentials
   cat /opt/hrms-unified/.env | grep DB_
   
   # Test connection manually
   mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME>
   
   # Check firewall allows MySQL port
   sudo firewall-cmd --list-ports
   ```

### Service Keeps Restarting

```bash
# Check logs for errors
sudo journalctl -u hrms.service -f

# Common causes:
# - Database connection issues
# - Missing .env file
# - Port conflicts
# - Missing dependencies
```

### Cannot Access Application

1. **Check firewall:**
   ```bash
   sudo firewall-cmd --list-ports
   sudo firewall-cmd --permanent --add-port=4000/tcp
   sudo firewall-cmd --reload
   ```

2. **Check SELinux:**
   ```bash
   sudo setenforce 0  # Temporary
   # Or configure properly:
   sudo semanage port -a -t http_port_t -p tcp 4000
   ```

3. **Check service is running:**
   ```bash
   sudo systemctl status hrms.service
   ```

4. **Check port binding:**
   ```bash
   sudo ss -tlnp | grep 4000
   ```

### Frontend Shows 404

```bash
# Rebuild frontend
cd /opt/hrms-unified/client
sudo -u hrmsapp npm run build
cd ..

# Restart service
sudo systemctl restart hrms.service
```

### High Memory Usage

```bash
# Check memory usage
free -h
ps aux | grep node

# Adjust Node.js memory limit in service file
sudo nano /etc/systemd/system/hrms.service

# Add under [Service]:
Environment=NODE_OPTIONS="--max-old-space-size=2048"

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart hrms.service
```

### Logs Not Appearing

```bash
# Check journald is running
sudo systemctl status systemd-journald

# Check log size limits
sudo journalctl --disk-usage

# View service logs directly
sudo journalctl -u hrms.service --no-pager
```

---

## 🔧 Maintenance

### Update Application

```bash
# Stop service
sudo systemctl stop hrms.service

# Backup current version
sudo cp -r /opt/hrms-unified /opt/hrms-unified.backup

# Pull latest changes
cd /opt/hrms-unified
sudo -u hrmsapp git pull

# Install dependencies
sudo -u hrmsapp npm install
sudo -u hrmsapp bash -c "cd client && npm install"

# Rebuild frontend
sudo -u hrmsapp bash -c "cd client && npm run build"

# Start service
sudo systemctl start hrms.service

# Verify
sudo systemctl status hrms.service
```

### Backup Database

```bash
# Create backup script
cat > /opt/hrms-unified/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/hrms-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Load DB credentials from .env
source /opt/hrms-unified/.env

mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/hrmsdb_$DATE.sql
gzip $BACKUP_DIR/hrmsdb_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/hrms-unified/scripts/backup-db.sh

# Run manually
sudo /opt/hrms-unified/scripts/backup-db.sh

# Or schedule with cron
sudo crontab -e
# Add: 0 2 * * * /opt/hrms-unified/scripts/backup-db.sh
```

### Monitor Application

```bash
# Real-time monitoring
watch -n 2 'systemctl status hrms.service'

# Monitor logs
sudo journalctl -u hrms.service -f

# Monitor resource usage
top -p $(pgrep -f "node.*server.js")

# Monitor port
watch -n 2 'sudo ss -tlnp | grep 4000'
```

### Log Rotation

Systemd journald handles log rotation automatically, but you can configure:

```bash
# Edit journald config
sudo nano /etc/systemd/journald.conf

# Set limits:
SystemMaxUse=500M
SystemKeepFree=1G
MaxRetentionSec=7day

# Restart journald
sudo systemctl restart systemd-journald
```

### Performance Tuning

```bash
# Increase file descriptors
sudo nano /etc/systemd/system/hrms.service

# Add under [Service]:
LimitNOFILE=65536

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart hrms.service
```

### Security Hardening

```bash
# Run as non-root user (already configured)
# Restrict service permissions
sudo nano /etc/systemd/system/hrms.service

# Add under [Service]:
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/hrms-unified/logs

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart hrms.service
```

---

## 📚 Additional Resources

### Project Documentation
- **README.md** - Project overview and features
- **SETUP_GUIDE.md** - Detailed setup instructions
- **swagger.yaml** - API documentation
- **db/init.sql** - Database schema

### Useful Commands Reference

```bash
# System Information
cat /etc/redhat-release          # RHEL version
uname -a                          # Kernel info
free -h                           # Memory usage
df -h                             # Disk usage

# Service Management
systemctl list-units --type=service  # All services
systemctl list-unit-files            # All unit files
systemctl cat hrms.service           # View service file

# Network
ss -tlnp                          # All listening ports
firewall-cmd --list-all           # Firewall rules
ip addr show                      # Network interfaces

# Process Management
ps aux | grep node                # Node processes
pgrep -f "node.*server"          # Find Node PID
kill -9 <PID>                    # Kill process

# Logs
journalctl --list-boots           # Boot history
journalctl -p err                 # Error logs only
journalctl --since today          # Today's logs
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | Database hostname/IP | 10.0.0.89 |
| DB_PORT | Database port | 3306 |
| DB_USER | Database username | root |
| DB_PASSWORD | Database password | P@ssw0rd |
| DB_NAME | Database name | hrmsdb |
| DB_SSL | Use SSL for DB | false |
| PORT | Application port | 4000 |
| NODE_ENV | Environment | production |
| JWT_SECRET | JWT secret key | your_secret_key |
| CORS_ORIGIN | CORS origin | http://server:4000 |
| LOG_LEVEL | Logging level | info |
| LOG_FILE | Log file path | logs/hrms.log |

---

## 🎯 Production Checklist

Before going live:

- [ ] Node.js v16+ installed
- [ ] Application cloned to /opt/hrms-unified
- [ ] .env file configured with production values
- [ ] Dependencies installed (npm run install-all)
- [ ] Frontend built (cd client && npm run build)
- [ ] Database accessible from RHEL server
- [ ] Firewall configured (port 4000 open)
- [ ] SELinux configured (if enabled)
- [ ] Systemd service installed
- [ ] Service enabled (auto-start on boot)
- [ ] Service running and healthy
- [ ] API endpoints responding
- [ ] Frontend accessible
- [ ] Logs clean and no errors
- [ ] Auto-restart tested
- [ ] Auto-start on boot tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 🆘 Support

If you encounter issues:

1. **Check logs**: `sudo journalctl -u hrms.service -f`
2. **Check service status**: `sudo systemctl status hrms.service`
3. **Verify configuration**: `cat /opt/hrms-unified/.env`
4. **Test database**: `npm run test-db`
5. **Check firewall**: `sudo firewall-cmd --list-ports`
6. **Review this guide**: Check troubleshooting section

---

## 📄 License

This project is licensed under the ISC License.

---

**🎉 Your HRMS application is now production-ready on RHEL with auto-restart on reboot!**

For questions or issues, refer to the troubleshooting section or check the logs.