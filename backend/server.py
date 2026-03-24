"""
FOMO Platform - NestJS Backend
This file is kept for compatibility with supervisor config.
The actual NestJS server runs separately.
"""
import os
import sys
import subprocess
import signal
import threading
import time

# NestJS process reference
nestjs_process = None

def start_nestjs():
    """Start NestJS server"""
    global nestjs_process
    
    os.chdir('/app/backend')
    env = os.environ.copy()
    env['PORT'] = '8001'
    env['PUPPETEER_EXECUTABLE_PATH'] = '/usr/bin/chromium'
    env['NODE_ENV'] = 'development'
    
    # Load .env
    env_file = '/app/backend/.env'
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env[key] = value
    
    # Start NestJS
    nestjs_process = subprocess.Popen(
        ['node', '/app/backend/dist/main.js'],
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    return nestjs_process

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    global nestjs_process
    if nestjs_process:
        nestjs_process.terminate()
        nestjs_process.wait(timeout=10)
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# Start NestJS and wait
if __name__ == '__main__':
    if not os.path.exists('/app/backend/dist/main.js'):
        print("ERROR: NestJS not built. Run: cd /app/backend && npm run build")
        sys.exit(1)
    
    proc = start_nestjs()
    proc.wait()
