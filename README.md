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

Default Database Configuration:
```properties
DB_HOST=localhost
DB_PORT=3307
DB_NAME=hrmsdb
DB_USER=root
```

Note: Update the database connection settings in `config.properties` if your setup differs.

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hrmsdb
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL_MODE=prefer

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 5. Build the Frontend
```bash
cd client
npm run build
cd ..
```

### 6. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Production mode
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

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
│   ├── new_schema.sql     # Database schema
│   └── sample_data.sql    # Sample data
├── routes/                # Backend API routes
├── utils/                 # Utility functions
├── config/               # Configuration files
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
2. Verify database credentials in `.env`
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
1. Port conflicts: Change PORT in `.env`
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
