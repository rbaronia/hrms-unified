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

# Function to check if a systemd service is installed and running
check_service() {
    local service=$1
    if systemctl list-unit-files | grep -q "^$service"; then
        echo "✅ $service service is installed"
        if systemctl is-active --quiet $service; then
            echo "✅ $service service is running"
            return 0
        else
            echo "❌ $service service is not running"
            return 1
        fi
    else
        echo "❌ $service service is not installed"
        return 1
    fi
}

# Function to extract MySQL credentials from .env
get_mysql_credentials() {
    if [ ! -f ".env" ]; then
        echo "localhost 3306 hrmsuser ''"
        return
    }
    
    source .env
    
    local host=${DB_HOST:-localhost}
    local port=${DB_PORT:-3306}
    local user=${DB_USER:-hrmsuser}
    local pass=${DB_PASSWORD:-""}
    
    echo "$host $port $user $pass"
}

# Function to check MySQL connection
check_mysql() {
    if ! check_service "mysqld"; then
        return 1
    fi
    
    # Get MySQL credentials
    read host port user pass <<< $(get_mysql_credentials)
    
    # Try to connect to MySQL
    if mysql -h $host -P $port -u $user -p"$pass" -e "SELECT 1" &> /dev/null; then
        echo "✅ MySQL connection successful"
        # Check if database exists
        if mysql -h $host -P $port -u $user -p"$pass" -e "USE hrmsdb" &> /dev/null; then
            echo "✅ Database 'hrmsdb' exists"
        else
            echo "❌ Database 'hrmsdb' does not exist"
            return 1
        fi
    else
        echo "❌ MySQL connection failed"
        return 1
    fi
}

# Function to check SELinux status
check_selinux() {
    if command -v getenforce &> /dev/null; then
        local status=$(getenforce)
        echo "✅ SELinux is $status"
        if [ "$status" = "Enforcing" ]; then
            # Check required SELinux booleans
            local booleans=("httpd_can_network_connect" "httpd_can_network_connect_db")
            for bool in "${booleans[@]}"; do
                if getsebool -a | grep -q "^$bool --> on$"; then
                    echo "✅ SELinux boolean $bool is enabled"
                else
                    echo "❌ SELinux boolean $bool is not enabled"
                    return 1
                fi
            done
        fi
        return 0
    else
        echo "ℹ️ SELinux is not installed"
        return 0
    fi
}

# Function to check firewall
check_firewall() {
    if command -v firewall-cmd &> /dev/null; then
        echo "✅ firewalld is installed"
        if systemctl is-active --quiet firewalld; then
            echo "✅ firewalld is running"
            # Check if required ports are open
            local ports=("3000/tcp" "3306/tcp")
            for port in "${ports[@]}"; do
                if firewall-cmd --list-ports | grep -q "$port"; then
                    echo "✅ Port $port is open in firewall"
                else
                    echo "❌ Port $port is not open in firewall"
                    return 1
                fi
            done
        else
            echo "❌ firewalld is not running"
            return 1
        fi
    else
        echo "ℹ️ firewalld is not installed"
    fi
    return 0
}

# Function to check if config file exists and has required properties
check_env() {
    if [ ! -f ".env" ]; then
        echo "❌ .env file not found"
        return 1
    fi
    
    local required_vars=(
        "DB_HOST"
        "DB_PORT"
        "DB_USER"
        "DB_PASSWORD"
        "DB_NAME"
        "PORT"
        "NODE_ENV"
        "JWT_SECRET"
        "CORS_ORIGIN"
    )
    
    local missing=0
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            echo "❌ Missing required environment variable: $var"
            missing=1
        fi
    done
    
    if [ $missing -eq 0 ]; then
        echo "✅ .env file is valid"
        return 0
    else
        return 1
    fi
}

# Store any errors
errors=0

# Check Node.js
if ! check_command "node" "Node.js" "node --version"; then
    errors=$((errors + 1))
fi

# Check npm
if ! check_command "npm" "npm" "npm --version"; then
    errors=$((errors + 1))
fi

# Check Git
if ! check_command "git" "Git" "git --version"; then
    errors=$((errors + 1))
fi

# Check MySQL
if ! check_mysql; then
    errors=$((errors + 1))
fi

# Check environment configuration
if ! check_env; then
    errors=$((errors + 1))
fi

# Check SELinux
if ! check_selinux; then
    errors=$((errors + 1))
fi

# Check firewall
if ! check_firewall; then
    errors=$((errors + 1))
fi

# Summary
echo -e "\nPrerequisites check completed."
if [ $errors -eq 0 ]; then
    echo "✅ All prerequisites are satisfied!"
    exit 0
else
    echo "❌ Found $errors issue(s) that need to be addressed."
    exit 1
fi
