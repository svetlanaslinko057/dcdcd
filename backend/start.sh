#!/bin/bash
cd /app/backend
export NODE_ENV=development
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
exec node dist/main.js
