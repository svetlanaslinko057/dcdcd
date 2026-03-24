#!/bin/bash
# NestJS Backend Starter

cd /app/backend

export PORT=8001
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
export NODE_ENV=development

# Load env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if built
if [ ! -f dist/main.js ]; then
    echo "Building NestJS..."
    npm run build
fi

# Start NestJS
exec node dist/main.js
