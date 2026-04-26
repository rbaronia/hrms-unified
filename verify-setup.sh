#!/bin/bash

# HRMS Setup Verification Script
# This script checks if everything is ready to run

echo "🔍 HRMS Setup Verification"
echo "=========================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check npm
echo -n "Checking npm version... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check required variables
    echo "  Checking required environment variables:"
    
    if grep -q "^DB_HOST=" .env; then
        echo -e "    ${GREEN}✓${NC} DB_HOST"
    else
        echo -e "    ${RED}✗${NC} DB_HOST missing"
    fi
    
    if grep -q "^DB_USER=" .env; then
        echo -e "    ${GREEN}✓${NC} DB_USER"
    else
        echo -e "    ${RED}✗${NC} DB_USER missing"
    fi
    
    if grep -q "^DB_PASSWORD=" .env; then
        echo -e "    ${GREEN}✓${NC} DB_PASSWORD"
    else
        echo -e "    ${RED}✗${NC} DB_PASSWORD missing"
    fi
    
    if grep -q "^DB_NAME=" .env; then
        echo -e "    ${GREEN}✓${NC} DB_NAME"
    else
        echo -e "    ${RED}✗${NC} DB_NAME missing"
    fi
    
    if grep -q "^PORT=" .env; then
        echo -e "    ${GREEN}✓${NC} PORT"
    else
        echo -e "    ${YELLOW}⚠${NC} PORT not set (will use default 4000)"
    fi
else
    echo -e "${RED}✗ Not found${NC}"
    echo -e "  ${YELLOW}Please create .env file from .env.example${NC}"
    exit 1
fi

# Check node_modules
echo -n "Checking backend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo -e "  Run: ${YELLOW}npm install${NC}"
fi

# Check client node_modules
echo -n "Checking frontend dependencies... "
if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo -e "  Run: ${YELLOW}cd client && npm install${NC}"
fi

# Check client build
echo -n "Checking frontend build... "
if [ -d "client/build" ]; then
    echo -e "${GREEN}✓${NC} Built"
else
    echo -e "${YELLOW}⚠${NC} Not built"
    echo -e "  Run: ${YELLOW}cd client && npm run build${NC}"
fi

# Check logs directory
echo -n "Checking logs directory... "
if [ -d "logs" ]; then
    echo -e "${GREEN}✓${NC} Exists"
else
    echo -e "${YELLOW}⚠${NC} Creating logs directory..."
    mkdir -p logs
    echo -e "  ${GREEN}✓${NC} Created"
fi

echo ""
echo "=========================="
echo "📋 Summary"
echo "=========================="

# Determine overall status
if [ -f ".env" ] && [ -d "node_modules" ] && [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓ System is ready to run!${NC}"
    echo ""
    echo "To start the application:"
    echo "  Production mode: ${GREEN}npm start${NC}"
    echo "  Development mode: ${GREEN}npm run dev${NC}"
    echo ""
    echo "If frontend is not built, run first:"
    echo "  ${YELLOW}cd client && npm run build && cd ..${NC}"
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    echo "Run these commands to complete setup:"
    if [ ! -f ".env" ]; then
        echo "  1. ${YELLOW}cp .env.example .env${NC} (then edit with your DB credentials)"
    fi
    if [ ! -d "node_modules" ]; then
        echo "  2. ${YELLOW}npm install${NC}"
    fi
    if [ ! -d "client/node_modules" ]; then
        echo "  3. ${YELLOW}cd client && npm install && cd ..${NC}"
    fi
    if [ ! -d "client/build" ]; then
        echo "  4. ${YELLOW}cd client && npm run build && cd ..${NC}"
    fi
    echo ""
    echo "Or run all at once:"
    echo "  ${GREEN}npm run install-all && cd client && npm run build && cd ..${NC}"
fi

echo ""

# Made with Bob
