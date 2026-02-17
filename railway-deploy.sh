#!/bin/bash

# Railway Deployment Helper Script
# This script helps with common Railway deployment tasks

set -e

echo "🚀 African Fashion eCommerce - Railway Deployment Helper"
echo "========================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Display menu
echo ""
echo "Select an option:"
echo "1. Initialize Railway project"
echo "2. Generate secrets for environment variables"
echo "3. Deploy backend service"
echo "4. Deploy frontend service"
echo "5. Run database migrations"
echo "6. View service logs"
echo "7. Open Railway dashboard"
echo "8. Check deployment status"
echo "0. Exit"
echo ""

read -p "Enter your choice [0-8]: " choice

case $choice in
    1)
        echo -e "${YELLOW}Initializing Railway project...${NC}"
        railway login
        railway init
        echo -e "${GREEN}✓ Railway project initialized${NC}"
        ;;
    2)
        echo -e "${YELLOW}Generating secure secrets...${NC}"
        echo ""
        echo "Add these to your Railway environment variables:"
        echo "================================================"
        echo "JWT_SECRET=$(generate_secret)"
        echo "JWT_REFRESH_SECRET=$(generate_secret)"
        echo "NEXTAUTH_SECRET=$(generate_secret)"
        echo ""
        echo -e "${GREEN}✓ Secrets generated${NC}"
        ;;
    3)
        echo -e "${YELLOW}Deploying backend service...${NC}"
        railway up --service african-fashion-backend
        echo -e "${GREEN}✓ Backend deployed${NC}"
        ;;
    4)
        echo -e "${YELLOW}Deploying frontend service...${NC}"
        railway up --service african-fashion-frontend
        echo -e "${GREEN}✓ Frontend deployed${NC}"
        ;;
    5)
        echo -e "${YELLOW}Running database migrations...${NC}"
        railway run --service african-fashion-backend npm run migration:run
        echo -e "${GREEN}✓ Migrations completed${NC}"
        ;;
    6)
        echo "Select service:"
        echo "1. Backend"
        echo "2. Frontend"
        read -p "Enter choice [1-2]: " service_choice
        
        case $service_choice in
            1)
                railway logs --service african-fashion-backend
                ;;
            2)
                railway logs --service african-fashion-frontend
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                ;;
        esac
        ;;
    7)
        echo -e "${YELLOW}Opening Railway dashboard...${NC}"
        railway open
        ;;
    8)
        echo -e "${YELLOW}Checking deployment status...${NC}"
        railway status
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
