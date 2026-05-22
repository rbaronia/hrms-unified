# HRMS - Human Resource Management System

A modern, full-stack HRMS application built with Node.js, Express, React, and MySQL. Designed for user and department management with a clean, responsive UI.

---

## 🌟 Features

- **User Management**: Complete CRUD operations for users
- **Department Hierarchy**: Visual tree structure with parent-child relationships
- **User Types**: Flexible user type management
- **Dashboard**: Real-time statistics and distribution charts
- **Manager Assignment**: Unique manager selection with no duplicates
- **Responsive UI**: Material-UI based modern interface
- **Notifications**: Global notification system for user feedback
- **Status Management**: Active, Disabled, and Terminated user states

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm run install-all

# 2. Build frontend
cd client && npm run build && cd ..

# 3. Start application
npm start
```

Access at: **http://localhost:4000**

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**
🚀 **For RHEL production deployment with auto-restart, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 📋 Prerequisites

- Node.js v16+
- npm v8+
- MySQL v8+ (remote database)
- `.env` file configured

---

## 🔧 Configuration

Create a `.env` file in the root directory:

```properties
# Database Configuration
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=hrmsdb
DB_SSL=false

# Server Configuration
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:4000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/hrms.log
```

---

## 📁 Project Structure

```
hrms-unified/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── config/                # Configuration files
├── controllers/           # Route controllers
├── db/                    # Database scripts
├── middleware/            # Express middleware
├── routes/                # API routes
├── utils/                 # Backend utilities
├── server.js              # Express server
└── .env                   # Environment variables
```

---

## 🛠️ Available Commands

### Development
```bash
npm start              # Start production mode
npm run dev            # Start development mode (hot reload)
npm run build          # Build frontend only
```

### Installation
```bash
npm install            # Install backend dependencies
npm run install-all    # Install all dependencies
```

### Testing
```bash
npm test               # Run tests
npm run test-db        # Test database connection
./verify-setup.sh      # Verify complete setup
```

### Maintenance
```bash
npm run stop           # Stop the server
npm run lint           # Run linter
npm run format         # Format code
```

---

## 🗄️ Database Schema

### Main Tables

- **USER**: User information and credentials
- **DEPARTMENT**: Department hierarchy
- **USERTYPE**: User type definitions

### Views

- **USER_DETAILS**: Denormalized view with department names, user type names, and manager userids

---

## 🔌 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/managers` - Get all managers (unique)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### User Types
- `GET /api/usertypes` - Get all user types
- `GET /api/usertypes/:id` - Get user type by ID
- `POST /api/usertypes` - Create user type
- `PUT /api/usertypes/:id` - Update user type
- `DELETE /api/usertypes/:id` - Delete user type

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

---

## 🎨 Frontend Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization

---

## 🔧 Backend Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL2** - Database driver
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

---

## 🔐 Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- SQL injection protection (parameterized queries)
- XSS protection (React built-in)
- Input validation

---

## 📊 Recent Improvements

### Fixed Issues
✅ Duplicate manager entries in dropdown
✅ Navigation path bugs
✅ Database connection configuration
✅ Status color logic in dashboard

### New Features
✅ Global notification system
✅ Improved error handling
✅ Better UI polish and styling
✅ Unique manager selection

---

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting steps.

Common issues:
- **Cannot connect to database**: Check .env credentials and IP whitelist
- **Port already in use**: Change PORT in .env or kill existing process
- **Module not found**: Run `npm run install-all`
- **index.html not found**: Rebuild frontend with `cd client && npm run build`

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete RHEL production deployment with systemd auto-restart
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Development setup and running instructions
- **[swagger.yaml](swagger.yaml)** - API documentation
- **[db/init.sql](db/init.sql)** - Database schema

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🆘 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review logs: `tail -f server.log`
3. Check browser console (F12)
4. Verify .env configuration

---

## ✨ Acknowledgments

Built with modern web technologies for efficient HR management and IAM/JML simulation.

---

**Made with ❤️ for efficient HR management**
