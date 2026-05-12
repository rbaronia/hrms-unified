# HRMS Application - Setup & Running Guide

Complete guide for setting up and running the HRMS application with a remote MySQL database.

---

## 📋 Prerequisites

- ✅ Node.js v16+ and npm v8+
- ✅ Remote MySQL database accessible
- ✅ `.env` file configured with database credentials

### Verify Prerequisites

```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

---

## 🚀 Quick Start (3 Steps)

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

## 📝 Detailed Setup Instructions

### Step 1: Configure Environment

Create/verify your `.env` file with these settings:

```properties
# Database Configuration (REQUIRED)
DB_HOST=10.0.0.89
DB_PORT=3306
DB_USER=root
DB_PASSWORD=P@ssw0rd
DB_NAME=hrmsdb
DB_SSL=false

# Server Configuration
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://target.demo.com:4000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/hrms.log
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

This installs:
- Backend: Express, MySQL2, CORS, etc. (~575 packages)
- Frontend: React, Material-UI, etc. (~1546 packages)

### Step 3: Build Frontend

```bash
cd client
npm run build
cd ..
```

Creates optimized production build in `client/build/`

### Step 4: Start Application

**Production Mode (Recommended):**
```bash
npm start
```
- Serves both API and frontend
- Access at: http://localhost:4000

**Development Mode (Hot Reload):**
```bash
npm run dev
```
- Backend: port 4000
- Frontend dev server: port 3000
- Auto-reloads on code changes
- Access at: http://localhost:3000

---

## ✅ Verification

### Test Backend API

```bash
# Test users endpoint
curl http://localhost:4000/api/users

# Test managers endpoint (should show no duplicates)
curl http://localhost:4000/api/users/managers

# Test departments
curl http://localhost:4000/api/departments
```

### Test Frontend

1. Open browser: http://localhost:4000
2. Verify:
   - ✅ Dashboard loads with statistics
   - ✅ Navigate to Users page
   - ✅ Create/Edit/Delete user works
   - ✅ Manager dropdown shows unique entries
   - ✅ Departments page loads
   - ✅ User Types page loads

---

## 🔧 Available Commands

```bash
# Development
npm start                # Start production mode
npm run dev              # Start development mode with hot reload
npm run build            # Build frontend only

# Installation
npm install              # Install backend dependencies
npm run install-all      # Install all dependencies

# Testing & Verification
npm run test-db          # Test database connection
npm test                 # Run tests
./verify-setup.sh        # Verify complete setup

# Maintenance
npm run stop             # Stop the server
npm run lint             # Run linter
npm run format           # Format code
```

---

## 🐛 Troubleshooting

### Cannot Connect to Database

```bash
# Check if remote DB is accessible
ping 10.0.0.89

# Verify .env credentials
cat .env | grep DB_

# Test connection directly
mysql -h 10.0.0.89 -u root -pP@ssw0rd hrmsdb
```

**Solutions:**
- Verify IP is whitelisted on remote database
- Check firewall allows port 3306
- Confirm credentials are correct
- Ensure DB_SSL setting matches database requirements

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
```

### Module Not Found Errors

```bash
# Clean reinstall backend
rm -rf node_modules package-lock.json
npm install

# Clean reinstall frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Frontend Shows "index.html not found"

```bash
# Rebuild frontend
cd client
npm run build
cd ..

# Restart server
npm start
```

### Duplicate Managers in Dropdown

**Fixed!** The manager dropdown now shows unique entries only.
- Issue was duplicate user records in database
- Solution: API now uses `GROUP BY` to return unique managers

### npm Cache Permission Issues

```bash
# Fix npm cache permissions
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# Clear cache and reinstall
npm cache clean --force
npm install
```

---

## 📊 Database Information

### Database Schema

The application uses these main tables:
- `USER` - User information
- `DEPARTMENT` - Department hierarchy
- `USERTYPE` - User type definitions
- `USER_DETAILS` - View with denormalized data

### USER_DETAILS View

A database view that provides:
- Manager USERID (instead of ID)
- Department NAME (instead of DEPTID)
- User Type NAME (instead of TYPEID)

```sql
SELECT * FROM USER_DETAILS LIMIT 5;
```

---

## 🔐 Security Notes

⚠️ **For Remote Database:**
- Ensure your IP is whitelisted
- Use strong passwords
- Enable SSL if supported (set DB_SSL=true)
- Don't commit .env file (already in .gitignore)
- Firewall should only allow necessary ports

---

## 📈 Recent Improvements

### Fixed Issues:
✅ **Duplicate Manager Entries** - Manager dropdown now shows unique entries
✅ **Navigation Bugs** - Back/Cancel buttons work correctly
✅ **Database Connection** - Fixed config path issues
✅ **UI Polish** - Improved navigation styling and colors

### New Features:
✅ **Global Notifications** - Success/error messages for user actions
✅ **Better Error Handling** - User-friendly error messages
✅ **Improved Dashboard** - Correct status colors (Green=Active, Orange=Disabled, Red=Terminated)

---

## 🎯 Application Features

### User Management
- Create, Read, Update, Delete users
- Manager assignment (unique dropdown)
- Department assignment
- User type assignment
- Status management (Active/Disabled/Terminated)

### Dashboard
- User statistics by status
- Department distribution chart
- User type distribution chart
- Recent activity

### Department Management
- Hierarchical department structure
- Department CRUD operations
- User count per department

### User Types
- User type definitions
- Type assignment to users

---

## 📱 Server Management

### Running in Background

```bash
# Start in background
npm start > server.log 2>&1 &

# View logs
tail -f server.log

# Stop server
pkill -f "node server.js"
# or
npm run stop
```

### Check Server Status

```bash
# Check if server is running
ps aux | grep "node server.js"

# Check port usage
lsof -i :4000

# View recent logs
tail -20 server.log
```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `tail -f server.log`
2. **Check browser console**: Press F12
3. **Verify .env**: Ensure all required variables are set
4. **Test database**: Run `npm run test-db`
5. **Review this guide**: Check troubleshooting section

---

## 📚 Additional Resources

- **README.md** - Project overview and architecture
- **db/init.sql** - Database schema
- **swagger.yaml** - API documentation
- **.env.example** - Environment variable template

---

## ✨ Success Checklist

Once running, verify:
- ✅ Server starts without errors
- ✅ Database connection successful
- ✅ Frontend loads at http://localhost:4000
- ✅ Dashboard shows statistics
- ✅ User list displays correctly
- ✅ Manager dropdown shows unique entries
- ✅ Create/Edit/Delete operations work
- ✅ Notifications appear for actions
- ✅ Navigation works smoothly

---

**🎉 You're all set! The HRMS application is ready to use.**

For questions or issues, check the troubleshooting section or review the logs.