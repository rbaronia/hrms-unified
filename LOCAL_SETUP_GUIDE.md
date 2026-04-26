# HRMS Local Setup Guide - macOS

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed
- ✅ npm v8+ installed
- ✅ Remote MySQL database accessible
- ✅ `.env` file configured with remote DB credentials

### Verify Prerequisites

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version
```

If you need to install/update Node.js:
```bash
# Using Homebrew
brew install node@18
```

---

## Step-by-Step Setup

### Step 1: Navigate to Project Directory

```bash
cd /Users/rkb/Localdocs/GitHub/hrms-unified
```

### Step 2: Verify .env Configuration

Make sure your `.env` file has the correct remote database settings:

```bash
# View your .env file
cat .env
```

Your `.env` should look like this (with your actual values):
```properties
# Database Configuration
DB_HOST=your-remote-db-host.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hrmsdb
DB_SSL=false

# Server Configuration
PORT=4000
NODE_ENV=development

# Security (optional for local testing)
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/hrms.log
```

### Step 3: Install Backend Dependencies

```bash
# Install root/backend dependencies
npm install
```

This will install all backend packages including:
- express
- mysql2
- cors
- dotenv
- etc.

### Step 4: Install Frontend Dependencies

```bash
# Navigate to client directory and install
cd client
npm install
cd ..
```

This installs React and all frontend dependencies.

### Step 5: Test Database Connection

```bash
# Test if you can connect to the remote database
npm run test-db
```

If this fails, check:
- Your remote DB host is accessible
- Firewall allows connections from your IP
- DB credentials are correct
- DB_SSL setting matches your database requirements

### Step 6: Build the Frontend

```bash
# Build the React frontend
cd client
npm run build
cd ..
```

This creates an optimized production build in `client/build/`.

### Step 7: Start the Application

Now you have two options:

#### Option A: Production Mode (Recommended for Testing)

```bash
# Start the server (serves both backend API and frontend)
npm start
```

The application will be available at: **http://localhost:4000**
(or whatever PORT you set in .env)

#### Option B: Development Mode (Hot Reload)

```bash
# Start both backend and frontend in dev mode
npm run dev
```

This will:
- Start backend on port 4000 (or your PORT setting)
- Start frontend dev server on port 3000
- Enable hot reload for code changes

Access the app at: **http://localhost:3000**

---

## Verification Steps

### 1. Check Backend is Running

Open a new terminal and test the API:

```bash
# Test the API endpoint
curl http://localhost:4000/api/users

# Or test dashboard endpoint
curl http://localhost:4000/api/dashboard
```

You should see JSON data returned.

### 2. Check Frontend

Open your browser and navigate to:
- Production mode: `http://localhost:4000`
- Development mode: `http://localhost:3000`

You should see the HRMS dashboard.

### 3. Test Basic Functionality

1. ✅ Dashboard loads with statistics
2. ✅ Navigate to Users page
3. ✅ View user list
4. ✅ Create a new user
5. ✅ Edit a user
6. ✅ Delete a user (check notification appears)
7. ✅ Navigate to Departments
8. ✅ Navigate to User Types

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if remote DB is accessible
ping your-remote-db-host.com

# Test MySQL connection directly
mysql -h your-remote-db-host.com -u your_db_user -p

# Check if your IP is whitelisted on remote DB
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find what's using the port
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clean install backend
rm -rf node_modules package-lock.json
npm install

# Clean install frontend
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Issue: Frontend shows "index.html not found"

**Solution:**
```bash
# Rebuild the frontend
cd client
npm run build
cd ..

# Restart the server
npm start
```

### Issue: CORS errors in browser console

**Solution:**
Check your `.env` file has:
```properties
CORS_ORIGIN=http://localhost:3000
```

Or if using production mode:
```properties
CORS_ORIGIN=http://localhost:4000
```

### Issue: Database SSL errors

**Solution:**
If your remote DB requires SSL:
```properties
DB_SSL=true
```

If it doesn't support SSL:
```properties
DB_SSL=false
```

---

## Quick Commands Reference

```bash
# Install all dependencies
npm run install-all

# Start production mode
npm start

# Start development mode
npm run dev

# Build frontend only
cd client && npm run build

# Test database connection
npm run test-db

# Stop the server (if running in background)
npm run stop

# View logs
tail -f logs/hrms.log
```

---

## Development Workflow

### Making Frontend Changes

1. Start in dev mode: `npm run dev`
2. Edit files in `client/src/`
3. Changes auto-reload in browser
4. When done, build: `cd client && npm run build`

### Making Backend Changes

1. Edit files in root directory (routes, controllers, etc.)
2. Restart server: `Ctrl+C` then `npm start`
3. Or use nodemon: `npm run dev`

---

## Database Schema

If you need to initialize or reset your remote database:

```bash
# Connect to your remote database
mysql -h your-remote-db-host.com -u your_db_user -p

# Then run the schema
mysql> source db/init.sql
```

Or from command line:
```bash
mysql -h your-remote-db-host.com -u your_db_user -p hrmsdb < db/init.sql
```

---

## Performance Tips

### For Better Performance:

1. **Use Production Mode** for testing:
   ```bash
   npm start
   ```

2. **Enable Compression** (already configured in server.js)

3. **Check Database Indexes**:
   ```sql
   SHOW INDEX FROM USER;
   SHOW INDEX FROM DEPARTMENT;
   ```

4. **Monitor Logs**:
   ```bash
   tail -f logs/hrms.log
   ```

---

## Security Notes for Remote DB

⚠️ **Important Security Considerations:**

1. **Whitelist Your IP**: Ensure your Mac's IP is whitelisted on the remote DB
2. **Use Strong Passwords**: Don't use default passwords
3. **SSL Connection**: Enable SSL if your remote DB supports it
4. **Firewall Rules**: Only allow necessary ports (3306 for MySQL)
5. **Don't Commit .env**: The `.env` file is in `.gitignore` - keep it that way

---

## Next Steps After Setup

Once running successfully:

1. ✅ Test all CRUD operations
2. ✅ Verify notifications appear
3. ✅ Check dashboard statistics
4. ✅ Test on different browsers
5. ✅ Review console for any errors
6. ✅ Check network tab for API calls

---

## Getting Help

If you encounter issues:

1. Check the logs: `tail -f logs/hrms.log`
2. Check browser console (F12)
3. Verify .env configuration
4. Test database connection separately
5. Review the troubleshooting section above

---

## Summary

**Quick Start Commands:**
```bash
# One-time setup
npm run install-all

# Every time you want to run
npm start

# Access the app
open http://localhost:4000
```

That's it! Your HRMS system should now be running locally with your remote database. 🚀