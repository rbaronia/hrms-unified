#!/bin/bash

echo "Checking prerequisites for HRMS application..."

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $2 is not installed"
        return 1
    else
        version=$($3)
        echo "✅ $2 is installed: $version"
        return 0
    fi
}

# Function to extract MySQL credentials from config.properties
get_mysql_credentials() {
    local jdbc_url=$(grep "^db.jdbcUrl=" config.properties | cut -d'=' -f2-)
    local host=$(echo $jdbc_url | sed -n 's/.*mysql:\/\/\([^:]*\):.*/\1/p')
    [ -z "$host" ] && host="localhost"
    
    local port=$(echo $jdbc_url | sed -n 's/.*:\/\/[^:]*:\([0-9]*\)\/.*/\1/p')
    [ -z "$port" ] && port="3306"
    
    local user=$(echo $jdbc_url | sed -n 's/.*[?&]user=\([^&]*\).*/\1/p')
    [ -z "$user" ] && user="root"
    
    local pass=$(echo $jdbc_url | sed -n 's/.*[?&]password=\([^&]*\).*/\1/p')
    [ -z "$pass" ] && pass=""
    
    echo "$host $port $user $pass"
}

# Function to check MySQL connection
check_mysql() {
    if mysql --version &> /dev/null; then
        echo "✅ MySQL is installed"
        
        # Get MySQL credentials
        read host port user pass <<< $(get_mysql_credentials)
        
        # Try to connect to MySQL
        if mysql -h $host -P $port -u $user -p$pass -e "SELECT 1" &> /dev/null; then
            echo "✅ MySQL connection successful"
            # Check if database exists
            if mysql -h $host -P $port -u $user -p$pass -e "USE hrmsdb" &> /dev/null; then
                echo "✅ Database 'hrmsdb' exists"
            else
                echo "❌ Database 'hrmsdb' does not exist"
                return 1
            fi
        else
            echo "❌ Could not connect to MySQL (check credentials in config.properties)"
            return 1
        fi
    else
        echo "❌ MySQL is not installed"
        return 1
    fi
}

# Function to check if config file exists and has required properties
check_config() {
    if [ -f "config.properties" ]; then
        echo "✅ config.properties exists"
        # Check for required properties
        required_props=("db.jdbcUrl" "server.port" "server.env")
        for prop in "${required_props[@]}"; do
            if grep -q "^$prop=" config.properties; then
                echo "✅ Found property: $prop"
            else
                echo "❌ Missing required property: $prop"
                return 1
            fi
        done
    else
        echo "❌ config.properties not found"
        return 1
    fi
}

# Store any errors
errors=0

# Check Node.js
check_command "node" "Node.js" "node --version" || errors=$((errors + 1))

# Check npm
check_command "npm" "npm" "npm --version" || errors=$((errors + 1))

# Check MySQL
check_mysql || errors=$((errors + 1))

# Check Git
check_command "git" "Git" "git --version" || errors=$((errors + 1))

# Check configuration
check_config || errors=$((errors + 1))

echo ""
if [ $errors -eq 0 ]; then
    echo "✅ All prerequisites are met!"
    exit 0
else
    echo "❌ Some prerequisites are missing. Please install them and try again."
    exit 1
fi
