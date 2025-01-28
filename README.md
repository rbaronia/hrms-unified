# HRMS Application

A modern Human Resource Management System (HRMS) built with Node.js and React. This application provides comprehensive user management features with a clean, intuitive interface.

## Features

### User Management
- Create, Read, Update, and Delete (CRUD) operations for users
- Advanced search functionality with multiple field filters
- Automatic User ID generation
- Manager assignment with hierarchy validation
- Department assignment with visual hierarchy
- User type management
- User status tracking

### Department Management
- Hierarchical department structure
- Visual indentation for department relationships
- Department-wise user grouping
- Validation to prevent circular references

### User Interface
- Modern, responsive design using Material-UI
- Interactive data grid with sorting and pagination
- Real-time search and filtering
- Success/Error notifications
- Form validation with helpful messages
- Mobile-friendly layout

### Security & Validation
- Input validation and sanitization
- Error handling with detailed logging
- Manager-subordinate relationship validation
- Secure API endpoints

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm (v8 or higher)
- Git

You can check if you have all prerequisites installed by running:
```bash
./scripts/check-prerequisites.sh
```

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hrms-unified.git
cd hrms-unified
```

2. Initialize the database:
```bash
mysql -u root -p < db/init.sql
```

3. Create configuration:
```bash
cat > config.properties << EOL
db.jdbcUrl=jdbc:mysql://localhost:3306/hrmsdb?user=root&password=your_password
server.port=3000
EOL
```

4. Install dependencies and build:
```bash
./scripts/manage-service.sh build
```

5. Start the application:
```bash
./scripts/manage-service.sh start
```

The application will be available at http://localhost:3000

## Detailed Installation Guide

### Database Setup

The database initialization script (`db/init.sql`) will:
1. Create a new database named 'hrmsdb'
2. Create all necessary tables (USER, DEPARTMENT, USERTYPE)
3. Set up foreign key relationships
4. Populate tables with sample data

You can customize the sample data by editing `db/init.sql` before running it.

### Configuration

The `config.properties` file supports the following options:

```properties
# Required
db.jdbcUrl=jdbc:mysql://localhost:3306/hrmsdb?user=root&password=your_password
server.port=3000

# Optional
logging.level=info
logging.file=logs/hrms.log
```

### Running as a Service

To install and run the application as a system service:

1. Install the service:
```bash
sudo ./scripts/install-service.sh
```

2. Manage the service:
```bash
sudo systemctl start hrms.service   # Start the service
sudo systemctl stop hrms.service    # Stop the service
sudo systemctl restart hrms.service # Restart the service
sudo systemctl status hrms.service  # Check status
```

3. View logs:
```bash
journalctl -u hrms.service -f
```

### Manual Operation

If you prefer to run the application manually:

1. Build the application:
```bash
./scripts/manage-service.sh build
```

2. Start the server:
```bash
./scripts/manage-service.sh start
```

3. Other commands:
```bash
./scripts/manage-service.sh stop    # Stop the server
./scripts/manage-service.sh restart # Restart the server
./scripts/manage-service.sh status  # Check status
```

## Installation on RHEL (Red Hat Enterprise Linux)

### Prerequisites

1. Install Node.js and npm:
```bash
# Add NodeSource repository
sudo dnf module enable nodejs:16
sudo dnf install nodejs npm

# Verify installation
node --version  # Should be v16.x or higher
npm --version   # Should be v8.x or higher
```

2. Install MySQL:
```bash
# Add MySQL repository
sudo dnf install mysql-server

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Secure MySQL installation
sudo mysql_secure_installation

# Verify MySQL is running
sudo systemctl status mysqld
```

3. Install Git:
```bash
sudo dnf install git
```

4. Install development tools:
```bash
sudo dnf groupinstall "Development Tools"
```

### Application Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hrms-unified.git
cd hrms-unified
```

2. Set up the database:
```bash
# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE hrmsdb;
CREATE USER 'hrmsuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON hrmsdb.* TO 'hrmsuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Initialize database schema
mysql -u hrmsuser -p hrmsdb < db/init.sql
```

3. Configure the application:
```bash
# Create .env file
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
```

4. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

5. Build the application:
```bash
# Build frontend
cd client
npm run build
cd ..

# Build backend (if using TypeScript)
npm run build
```

### Running as a Systemd Service

1. Create a service file:
```bash
sudo tee /etc/systemd/system/hrms.service << EOL
[Unit]
Description=HRMS Application
After=network.target mysqld.service

[Service]
Type=simple
User=hrms
WorkingDirectory=/opt/hrms-unified
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOL
```

2. Create system user:
```bash
sudo useradd -r -s /bin/false hrms
```

3. Set up application directory:
```bash
# Copy application to /opt
sudo cp -r . /opt/hrms-unified

# Set permissions
sudo chown -R hrms:hrms /opt/hrms-unified
sudo chmod -R 755 /opt/hrms-unified
```

4. Start and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start hrms
sudo systemctl enable hrms
```

### Firewall Configuration

1. Configure firewalld:
```bash
# Allow HTTP traffic
sudo firewall-cmd --permanent --add-port=3000/tcp

# Allow MySQL if needed externally
sudo firewall-cmd --permanent --add-port=3306/tcp

# Reload firewall
sudo firewall-cmd --reload
```

### SELinux Configuration

If SELinux is enabled:

```bash
# Allow Node.js to listen on port 3000
sudo semanage port -a -t http_port_t -p tcp 3000

# Allow Node.js network connections
sudo setsebool -P httpd_can_network_connect 1

# Allow Node.js to connect to MySQL
sudo setsebool -P httpd_can_network_connect_db 1
```

## Development

### Running in Development Mode

1. Start the backend server:
```bash
npm run dev
```

2. In another terminal, start the frontend development server:
```bash
cd client
npm start
```

The frontend will be available at http://localhost:3000 and will automatically reload when you make changes.

### Running Tests

```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

## Troubleshooting

1. If you see OpenSSL-related errors:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

2. If the service won't start:
- Check logs: `journalctl -u hrms.service -f`
- Verify MySQL is running: `systemctl status mysql`
- Check config.properties permissions
- Ensure all dependencies are installed

3. If you can't connect to MySQL:
- Verify MySQL is running: `systemctl status mysql`
- Check credentials in config.properties
- Ensure the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
