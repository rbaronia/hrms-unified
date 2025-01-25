# HRMS Application

A modern Human Resource Management System (HRMS) built with Node.js and React.

## Features

- Employee Management (CRUD operations)
- Department Management with hierarchy support
- User Type Management
- Dashboard with data visualizations
- Modern UI with Material-UI components
- Detailed logging for debugging

## Prerequisites

- Node.js (v14 or higher)
- MySQL/PostgreSQL (v8 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hrms-unified
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

3. Configure the environment:
Create a `.env` file in the root directory with the following content:
```env
# Database Configuration
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=hrmsdb
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL_MODE=prefer

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
```

4. Create a MySQL/PostgreSQL database and run the following SQL scripts:
```sql
CREATE DATABASE hrmsdb;

CREATE TABLE DEPARTMENT (
    DEPTID INTEGER NOT NULL,
    DEPTNAME VARCHAR(36) NOT NULL,
    PARENTID INTEGER
);

CREATE TABLE USERTYPE (
    TYPEID INTEGER NOT NULL,
    TYPENAME VARCHAR(36) NOT NULL
);

CREATE TABLE EMPLOYEE (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    FIRSTNAME VARCHAR(250) NOT NULL,
    LASTNAME VARCHAR(250) NOT NULL,
    STREETADDR VARCHAR(50),
    CITY VARCHAR(50),
    STATE VARCHAR(2),
    ZIPCODE VARCHAR(50),
    TITLE VARCHAR(50),
    MANAGER VARCHAR(500),
    ISMANAGER CHAR(1),
    EDULEVEL VARCHAR(50),
    STATUS CHAR(1) NOT NULL,
    DEPTNAME VARCHAR(100),
    USERTYPE VARCHAR(100),
    USERID VARCHAR(50),
    DATE_MODIFIED timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1;
```

## Running the Application

### Development Mode
Run both frontend and backend servers in development mode:
```bash
npm run dev
```
This will start:
- Backend server on http://localhost:3000
- Frontend development server on http://localhost:3001

### Production Mode
Build and start the production server:
```bash
npm run build && npm start
```
The application will be available at http://localhost:3000

## Configuration Files

### Database Configuration
The application uses the following configuration files:

1. `.env`: Environment variables for database connection, server settings, and logging
2. `config/config.js`: Application configuration including database and logging settings
3. `config/labels.js`: UI labels and text content

### Database Connection Settings
The application supports both MySQL and PostgreSQL with the following security settings:
- SSL Mode support
- Public Key Retrieval
- Connection pooling

## Features

### Employee Management
- View list of all employees
- Add new employees
- Edit existing employees
- Delete employees
- Automatic user ID generation based on name

### Department Management
- View department hierarchy
- Add new departments
- Edit department details
- Delete departments (with validation)

### User Type Management
- View all user types
- Add new user types
- Edit user types
- Delete user types (with validation)

### Dashboard
- Total employee count
- Department distribution chart
- User type distribution chart
- Recent hires list

## Logging

The application uses Winston for logging:
- File: `logs/hrms.log`
- Console output (during development)
- Log levels configurable via environment variables

## Project Structure
```
hrms-unified/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main App component
│   │   └── index.tsx     # Entry point
│   └── package.json
├── config/                # Configuration files
├── routes/               # API routes
├── utils/                # Utility functions
├── server.js            # Express server
├── package.json
└── .env                 # Environment variables
```

## Scripts

- `npm run dev`: Start development servers (frontend + backend)
- `npm start`: Start production server
- `npm run build`: Build frontend for production
- `npm test`: Run tests

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License.
