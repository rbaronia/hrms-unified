# HRMS Application

A modern Human Resource Management System (HRMS) built with Node.js and React. This application provides comprehensive employee management features with a clean, intuitive interface.

## Features

### Employee Management
- Create, Read, Update, and Delete (CRUD) operations for employees
- Advanced search functionality with multiple field filters
- Automatic User ID generation
- Manager assignment with hierarchy validation
- Department assignment with visual hierarchy
- User type management
- Employee status tracking

### Department Management
- Hierarchical department structure
- Visual indentation for department relationships
- Department-wise employee grouping
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
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm (v6 or higher) or yarn
- Git

## Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/rbaronia/hrms-unified.git
cd hrms-unified
```

### 2. Database Setup

You have two options to initialize the database:

#### Option 1: Using the Initialization Script (Recommended)
```bash
# This will create the database, import schema and data
mysql -u root -p < db/init.sql
```

#### Option 2: Manual Setup
```bash
# Create the database
mysql -u root -p
mysql> CREATE DATABASE hrmsdb;
mysql> exit

# Import schema
mysql -u root -p hrmsdb < db/schema.sql

# Import data
mysql -u root -p hrmsdb < db/data.sql
```

The database includes:
- Department hierarchy with 33 departments
- Employee table with sample records
- User types and permissions
- Pre-configured manager-subordinate relationships

### 3. Configuration Setup
Create a `config.properties` file in the root directory:
```properties
# Database Configuration
db.jdbcUrl=jdbc:mysql://localhost:3307/hrmsdb?user=root&password=your_password&ssl=false
db.queueLimit=0

# Server Configuration
server.port=3000
server.env=development

# Logging Configuration
logging.level=info
logging.file=logs/hrms.log
```

### 4. Install and Build
```bash
# Install and build everything (recommended)
./scripts/manage-service.sh build

# Or manually:
# Install backend dependencies
npm install

# Install and build frontend
cd client
npm install
npm run build
cd ..
```

### 5. Start the Application

#### Using Service Management Script (Recommended)
```bash
# Start in development mode
sudo ./scripts/manage-service.sh start-dev

# Start in production mode
sudo ./scripts/manage-service.sh start

# Check status
sudo ./scripts/manage-service.sh status

# Stop the service
sudo ./scripts/manage-service.sh stop
```

#### Manual Start
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Production mode
npm start
```

Note: The development mode requires the client to be built first. The service management script handles this automatically, but if you're running manually, make sure to build the client first.

## RHEL Server Deployment

Follow these steps to deploy the application as a system service on RHEL:

### Prerequisites
- RHEL 7 or later
- Root access or sudo privileges
- Node.js 14+ installed globally
- MySQL installed and running
- Git installed

### Installation Steps

1. Clone the repository in your home directory:
```bash
# As the user (e.g., ibmdemo)
cd ~
git clone https://github.com/rbaronia/hrms-unified.git
cd hrms-unified
```

2. Install dependencies and build:
```bash
# Install node dependencies and build the application
sudo ./scripts/manage-service.sh build
```

3. Configure the application:
```bash
# Copy the sample config
cp config.properties.sample config.properties

# Edit the configuration
vi config.properties
```

4. Install as a system service:
```bash
cd scripts
chmod +x install-service.sh
sudo ./install-service.sh
# When prompted, enter your username (e.g., ibmdemo)
```

5. Start the service:
```bash
sudo systemctl start hrms.service
```

### Service Management

All service management commands require sudo privileges. You can either:

1. Use sudo with each command (recommended):
```bash
# Check service status
sudo systemctl status hrms.service

# Start the service
sudo systemctl start hrms.service

# Stop the service
sudo systemctl stop hrms.service

# Restart the service
sudo systemctl restart hrms.service

# View logs
sudo journalctl -u hrms.service
```

2. Or switch to root first (alternative):
```bash
# Switch to root
sudo su -

# Then run commands without sudo
systemctl start hrms.service
systemctl status hrms.service
# etc...

# Exit root when done
exit
```

### Automatic Startup

The service is configured to:
- Start automatically when the server boots
- Restart automatically if it crashes
- Wait for MySQL to be available before starting
- Run with proper system permissions
- Run from the user's home directory

### Troubleshooting

1. If the service fails to start:
```bash
# Check the logs
sudo journalctl -u hrms.service -n 50 --no-pager

# Check service status
sudo systemctl status hrms.service

# Check if npm is in PATH for root
sudo which npm
# If npm not found, use full path
sudo systemctl edit hrms.service
# Add this under [Service]:
# Environment=PATH=/usr/local/bin:/usr/bin:/bin
```

2. If MySQL connection fails:
```bash
# Verify MySQL is running
sudo systemctl status mysqld

# Check MySQL logs
sudo journalctl -u mysqld
```

3. Permission issues:
```bash
# Check file ownership
ls -l ~/hrms-unified

# Fix permissions if needed
sudo chown -R $USER:$USER ~/hrms-unified

# Check service user
sudo systemctl show hrms.service | grep User

# Verify npm global installation
which npm
echo $PATH
```

4. If you get authentication prompts:
```bash
# Add yourself to the systemd-journal group to view logs
sudo usermod -a -G systemd-journal $USER

# Use sudo explicitly for all systemctl commands
sudo systemctl start hrms.service
```

## Utility Scripts

The application comes with utility scripts to help manage the service and check prerequisites:

### Prerequisites Check
```bash
# Check if all required software and configurations are in place
./scripts/check-prerequisites.sh
```

This script checks for:
- Node.js installation
- npm installation
- MySQL installation and connectivity
- Git installation
- Required configuration files and properties

### Service Management
```bash
# Build the application
sudo ./scripts/manage-service.sh build

# Start in production mode
sudo ./scripts/manage-service.sh start

# Start in development mode
sudo ./scripts/manage-service.sh start-dev

# Stop the service
sudo ./scripts/manage-service.sh stop

# Restart in production mode
sudo ./scripts/manage-service.sh restart

# Restart in development mode
sudo ./scripts/manage-service.sh restart-dev

# Check service status
sudo ./scripts/manage-service.sh status
```

The service management script:
- Automatically detects the port from config.properties
- Ensures only one instance is running
- Gracefully stops the service when requested
- Provides clear status information

## Project Structure
```
hrms-unified/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main App component
│   │   └── index.tsx      # Entry point
│   └── package.json       # Frontend dependencies
├── db/                    # Database scripts
│   ├── schema.sql        # Database schema
│   ├── data.sql          # Sample data
│   └── init.sql          # Database initialization
├── routes/                # Backend API routes
├── utils/                 # Utility functions
├── config/               # Configuration files
├── scripts/              # Utility scripts
│   ├── check-prerequisites.sh  # Check required software
│   └── manage-service.sh      # Manage application lifecycle
└── server.js             # Backend entry point
```

## API Documentation

### Employee Endpoints
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Department Endpoints
- `GET /api/employees/departments` - Get department hierarchy
- `GET /api/employees/managers` - Get all managers
- `GET /api/employees/usertypes` - Get all user types

## Common Issues & Solutions

### Database Connection Issues
1. Ensure MySQL is running
2. Verify database credentials in `config.properties`
3. Check if database and tables exist
4. Ensure proper privileges are granted to the database user

### Build Issues
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and reinstall: 
```bash
rm -rf node_modules
rm -rf client/node_modules
npm install
cd client && npm install
```

### Runtime Issues
1. Port conflicts: Change port in `config.properties`
2. Memory issues: Increase Node.js memory limit
```bash
export NODE_OPTIONS=--max-old-space-size=4096
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the maintainers.
