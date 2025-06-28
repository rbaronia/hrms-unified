# HRMS Application

A modern Human Resource Management System (HRMS) built with Node.js, Express, and React. Provides user and department management with a clean, responsive UI.

## Features
- User & department CRUD
- Manager hierarchy
- Visual department tree
- Responsive Material-UI frontend
- Input validation & error handling

## Prerequisites
- Node.js v16+
- MySQL v8+
- npm v8+
- Git

## Quick Start
1. **Clone the repository**
   ```bash
git clone https://github.com/yourusername/hrms-unified.git
cd hrms-unified
```
2. **Configure the database**
   - Create a database and user in MySQL:
     ```sql
     CREATE DATABASE hrmsdb;
     CREATE USER 'hrmsuser'@'localhost' IDENTIFIED BY 'your_secure_password';
     GRANT ALL PRIVILEGES ON hrmsdb.* TO 'hrmsuser'@'localhost';
     FLUSH PRIVILEGES;
     EXIT;
     ```
   - Initialize schema and sample data:
     ```bash
     mysql -u hrmsuser -p hrmsdb < db/init.sql
     # or for new schema
     mysql -u hrmsuser -p hrmsdb < db/new_schema.sql
     ```
3. **Set up environment**
   ```bash
cp .env.example .env
# Edit .env for your DB credentials and settings
```
4. **Install dependencies and build**
   ```bash
npm install
npm run build
```
5. **Start the application**
   ```bash
npm start
```
   The app will be available at http://localhost:<PORT> (where <PORT> is set in your .env file).

## Development
- Run in dev mode with hot reload:
  ```bash
  npm run dev
  ```
- Run tests:
  ```bash
  npm test
  ```

## Contributing
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to your branch: `git push origin feature/my-feature`
5. Submit a pull request

## License
MIT License. See LICENSE for details.

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

3. Create environment configuration:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Install dependencies and build:
```bash
npm run install-all
```

5. Start the application:
```bash
npm run service:start
```

The application will be available at http://localhost:<PORT> (where <PORT> is set in your .env file).

## Detailed Installation Guide

### Database Setup

The database initialization script (`db/init.sql`) will:
1. Create a new database named 'hrmsdb'
2. Create all necessary tables (USER, DEPARTMENT, USERTYPE)
3. Set up foreign key relationships
4. Populate tables with sample data

You can customize the sample data by editing `db/init.sql` before running it.

### Configuration

The `.env` file supports the following options:

```properties
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hrmsuser
DB_PASSWORD=your_secure_password
DB_NAME=hrmsdb
DB_SSL=false

# Server Configuration
PORT=<your_desired_port> # Set the backend port here
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/hrms.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Running as a Service

To install and run the application as a system service:

1. Install the service:
```bash
sudo npm run service:install
```

2. Manage the service:
```bash
sudo npm run service:start    # Start the service
sudo npm run service:stop     # Stop the service
sudo npm run service:restart  # Restart the service
sudo npm run service:status   # Check status
```

3. View logs:
```bash
journalctl -u hrms.service -f
```

### Database Backups

The application includes an automated backup script:

```bash
# Run a manual backup
npm run backup

# View backups in db/backups directory
ls -l db/backups
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
# Create .env file from example
cp .env.example .env
# Edit .env with your configuration
```

4. Install dependencies:
```bash
# Install all dependencies
npm run install-all
```

5. Build the application:
```bash
# Build frontend and backend
npm run build
```

### Running as a Systemd Service

1. Install the service:
```bash
sudo npm run service:install
```

2. Start and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start hrms
sudo systemctl enable hrms
```

### Firewall Configuration

1. Configure firewalld:
```bash
# Allow application port
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

1. Start the development server:
```bash
npm run dev
```

This will start both the backend and frontend in development mode with hot reloading.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:users
npm run test:departments
```

## Troubleshooting

1. If you see "index.html not found" error:
```bash
# Rebuild the frontend
cd client && npm run build
```

2. If the service won't start:
- Check logs: `journalctl -u hrms.service -f`
- Verify MySQL is running: `systemctl status mysqld`
- Check .env file permissions
- Ensure all dependencies are installed

3. If you can't connect to MySQL:
- Verify MySQL is running: `systemctl status mysqld`
- Check credentials in .env
- Ensure the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

4. SELinux Issues:
```bash
# Check SELinux status
getenforce

# View SELinux denials
sudo ausearch -m AVC -ts recent
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
