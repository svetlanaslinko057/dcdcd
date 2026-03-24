#!/bin/bash
#
# FOMO Crypto Intelligence Platform - Bootstrap Script
# Run this script to set up and start the platform from scratch
#
# Usage: ./scripts/bootstrap.sh [--clean] [--populate]
#   --clean     Remove node_modules and rebuild from scratch
#   --populate  Populate initial data after startup
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[FOMO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

CLEAN=false
POPULATE=false

for arg in "$@"; do
  case $arg in
    --clean) CLEAN=true ;;
    --populate) POPULATE=true ;;
  esac
done

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        FOMO Crypto Intelligence Platform v2.0                 ║${NC}"
echo -e "${BLUE}║        NestJS + Puppeteer + MongoDB                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check requirements
log "Checking requirements..."

if ! command -v node &> /dev/null; then
  error "Node.js is not installed. Please install Node.js 20+"
fi

if ! command -v npm &> /dev/null; then
  error "npm is not installed"
fi

if ! command -v yarn &> /dev/null; then
  warn "yarn not found, installing..."
  npm install -g yarn
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js 18+ required (found v$NODE_VERSION)"
fi

log "✓ Node.js $(node -v)"
log "✓ npm $(npm -v)"
log "✓ yarn $(yarn -v)"

# Install Chromium for Puppeteer
log "Checking Chromium installation..."
if ! command -v chromium &> /dev/null && [ ! -f /usr/lib/chromium/chromium ]; then
  log "Installing Chromium..."
  apt-get update && apt-get install -y chromium || warn "Could not install Chromium. Puppeteer may fail."
fi

if [ -f /usr/lib/chromium/chromium ]; then
  log "✓ Chromium installed at /usr/lib/chromium/chromium"
elif command -v chromium &> /dev/null; then
  log "✓ Chromium installed at $(which chromium)"
else
  warn "Chromium not found. Puppeteer scraping may not work."
fi

# Clean if requested
if [ "$CLEAN" = true ]; then
  log "Cleaning previous builds..."
  rm -rf /app/backend/node_modules /app/backend/dist
  rm -rf /app/frontend/node_modules /app/frontend/build
fi

# Install backend dependencies
log "Installing backend dependencies..."
cd /app/backend
npm install --legacy-peer-deps

# Build backend
log "Building NestJS backend..."
npm run build

# Check backend build
if [ ! -f /app/backend/dist/main.js ]; then
  error "Backend build failed - dist/main.js not found"
fi
log "✓ Backend built successfully"

# Install frontend dependencies
log "Installing frontend dependencies..."
cd /app/frontend
yarn install --network-timeout 100000

log "✓ Frontend dependencies installed"

# Create .env files if not exist
if [ ! -f /app/backend/.env ]; then
  log "Creating backend .env..."
  cat > /app/backend/.env << 'EOF'
PORT=8001
MONGO_URL=mongodb://localhost:27017
DB_NAME=fomo_market
CORS_ORIGINS=*
NODE_ENV=development
EOF
fi

if [ ! -f /app/frontend/.env ]; then
  log "Creating frontend .env..."
  cat > /app/frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
fi

# Start services
log "Starting services via supervisor..."
sudo supervisorctl restart backend frontend || {
  warn "Supervisor restart failed, trying direct start..."
  cd /app/backend && node dist/main.js &
  cd /app/frontend && yarn start &
}

# Wait for services to start
log "Waiting for services to start..."
sleep 10

# Health check
log "Running health checks..."
HEALTH=$(curl -s http://localhost:8001/api/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH" | grep -q '"ok":true'; then
  log "✓ Backend is healthy"
else
  warn "Backend health check failed. Check logs: tail -f /var/log/supervisor/backend.err.log"
fi

# Populate data if requested
if [ "$POPULATE" = true ]; then
  echo ""
  log "Populating initial data..."
  
  log "Building knowledge graph..."
  curl -s -X POST http://localhost:8001/api/graph/rebuild | head -c 200
  echo ""
  
  log "Syncing Dropstab data (this may take a while)..."
  curl -s -X POST http://localhost:8001/api/intel/dropstab/sync/all | head -c 200
  echo ""
  
  log "Syncing news sources..."
  curl -s -X POST http://localhost:8001/api/news/sync/all | head -c 200
  echo ""
fi

# Final status
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Bootstrap complete!${NC}"
echo ""
echo "Services:"
echo "  Backend:  http://localhost:8001/api"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Quick tests:"
echo "  curl http://localhost:8001/api/health"
echo "  curl http://localhost:8001/api/intel/stats"
echo "  curl http://localhost:8001/api/graph/stats"
echo "  curl http://localhost:8001/api/market/quote?asset=BTC"
echo ""
echo "Logs:"
echo "  tail -f /var/log/supervisor/backend.err.log"
echo "  tail -f /var/log/supervisor/frontend.err.log"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
