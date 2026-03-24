# FOMO Crypto Intelligence Platform v2.0

## Status: FULLY MIGRATED TO NESTJS ✅

**Python backend removed** - Platform now runs entirely on NestJS + Puppeteer + MongoDB

## Quick Start

```bash
# Build backend
cd /app/backend && npm install && npm run build

# Install frontend dependencies
cd /app/frontend && yarn install

# Start NestJS backend
cd /app/backend && PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node dist/main.js &

# Restart frontend via supervisor
sudo supervisorctl restart frontend

# Populate data
curl -X POST http://localhost:8001/api/graph/rebuild
curl -X POST http://localhost:8001/api/intel/dropstab/sync/all
curl -X POST http://localhost:8001/api/intel/cryptorank/sync/all
```

## Migration Summary (2026-03-24)

| Component | Python (OLD) | NestJS (NEW) | Status |
|-----------|--------------|--------------|--------|
| Dropstab Scraper | httpx + BeautifulSoup | Puppeteer | ✅ Working |
| CryptoRank Scraper | httpx | Puppeteer | ✅ Working |
| News RSS Fetcher | feedparser | axios + RSS | ✅ Working |
| Knowledge Graph | Neo4j-style in Mongo | Mongoose | ✅ Working |
| Sentiment Engine | OpenAI + custom | FOMO Algorithm | ✅ Working |
| Market Gateway | Binance SDK | DefiLlama + Exchanges | ✅ Working |
| Auth | - | Password verification | ✅ Added |

## Files Removed
- `/app/temp_repo/` - Old cloned repository with Python backend
- `/app/backend-python-old/` - Not present in deployment
- All `.py` files except `server.py` wrapper

## Current Data (MongoDB)

| Collection | Count |
|------------|-------|
| Projects | 2 |
| Investors | 22 |
| Unlocks | 18 |
| Fundraising | 17 |
| Categories | 12 |
| Activity | 2 |

### Knowledge Graph
- **Total Nodes: 147**
- **Total Edges: 454**
- Node Types: project (31), person (39), token (25), asset (23), fund (19), exchange (10)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOMO Platform (NestJS)                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 19)                    Port: 3000              │
│  └── Dashboard, Graph Visualization, Auth                       │
├─────────────────────────────────────────────────────────────────┤
│  Backend (NestJS + Puppeteer)           Port: 8001              │
│  ├── /api/auth     - Password verification                      │
│  ├── /api/intel    - Dropstab, CryptoRank scrapers              │
│  ├── /api/news     - 26+ RSS sources                            │
│  ├── /api/graph    - Knowledge Graph                            │
│  ├── /api/sentiment - FOMO sentiment                            │
│  └── /api/market   - DefiLlama + Binance                        │
├─────────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                     Port: 27017             │
└─────────────────────────────────────────────────────────────────┘
```

## Working API Endpoints

### Auth
- `POST /api/auth/verify` - Password: `fomo2024`

### Intel
- `GET /api/intel/stats` - Collection statistics
- `GET /api/intel/projects` - List projects
- `GET /api/intel/investors` - List investors
- `GET /api/intel/unlocks` - List unlocks
- `POST /api/intel/dropstab/sync/all` - Sync Dropstab
- `POST /api/intel/cryptorank/sync/all` - Sync CryptoRank

### Graph
- `GET /api/graph/stats` - Graph statistics
- `GET /api/graph/network` - Network visualization data
- `GET /api/graph/search?q=query` - Search nodes
- `POST /api/graph/rebuild` - Rebuild graph

### Market
- `GET /api/market/quote?asset=BTC` - Single quote
- `GET /api/market/quotes?assets=BTC,ETH,SOL` - Multiple quotes

### Sentiment
- `POST /api/sentiment/analyze` - Analyze text

### News
- `GET /api/news/sources` - List RSS sources
- `GET /api/news/stats` - News statistics

## Access
- **URL**: https://data-parser-boot.preview.emergentagent.com
- **Password**: `fomo2024`

## Backlog

### P1 (Next)
- [ ] Auto-scheduler for periodic data sync
- [ ] WebSocket real-time updates
- [ ] More scraping endpoints (listings, launchpads)

### P2 (Future)
- [ ] Telegram bot for alerts
- [ ] LLM-powered sentiment analysis
- [ ] Historical trend tracking
