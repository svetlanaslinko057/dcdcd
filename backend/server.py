"""
FOMO Platform - NestJS Wrapper
This wrapper launches NestJS backend from supervisor's uvicorn command
"""
import subprocess
import os
import sys

os.chdir('/app/backend')
os.environ['PORT'] = '8001'
os.environ['PUPPETEER_EXECUTABLE_PATH'] = '/usr/bin/chromium'
os.environ['NODE_ENV'] = 'development'

# Load .env
env_file = '/app/backend/.env'
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

# Check if dist/main.js exists
if not os.path.exists('/app/backend/dist/main.js'):
    print("ERROR: NestJS not built. Run: cd /app/backend && npm run build")
    sys.exit(1)

# Execute NestJS
os.execvp('node', ['node', '/app/backend/dist/main.js'])
