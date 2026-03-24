# FOMO Crypto Intelligence Platform v2.0

## Quick Start

```bash
# Full bootstrap
cd /app/backend && npm install && npm run build
cd /app/frontend && yarn install
sudo supervisorctl restart frontend

# Start NestJS backend manually
cd /app/backend && PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node dist/main.js &

# Populate data
curl -X POST http://localhost:8001/api/graph/rebuild
curl -X POST http://localhost:8001/api/intel/dropstab/sync/all
curl -X POST http://localhost:8001/api/intel/cryptorank/sync/all
```

## Original Problem Statement
Клонировать репозиторий, поднять проект, запустить bootstrap, изучить систему. 
Запустить POST /api/graph/rebuild для построения графа.
Запустить парсеры Dropstab/CryptoRank для наполнения данных.

## What's Been Implemented (2026-03-24)

| Task | Status |
|------|--------|
| Cloned repository from GitHub | ✅ |
| Installed backend dependencies (NestJS) | ✅ |
| Installed Chromium for Puppeteer | ✅ |
| Built NestJS backend | ✅ |
| Installed frontend dependencies | ✅ |
| Added auth endpoint | ✅ |
| Started NestJS backend | ✅ |
| Ran /api/graph/rebuild | ✅ 147 nodes, 454 edges |
| Ran Dropstab sync | ✅ |
| Ran CryptoRank sync | ✅ |
| Frontend accessible with login | ✅ |

## Current Data Statistics

### Intel Collections
- Projects: 2
- Investors: 22
- Unlocks: 18
- Fundraising: 17
- Activity: 2
- Categories: 12

### Knowledge Graph
- Total Nodes: 147
- Total Edges: 454
- Node Types: exchange (10), person (39), token (25), asset (23), fund (19), project (31)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FOMO Platform                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 19)                    Port: 3000              │
│  ├── Dashboard, Charts, Knowledge Graph Visualization           │
│  └── Auth: Password "fomo2024"                                  │
├─────────────────────────────────────────────────────────────────┤
│  Backend (NestJS + Puppeteer)           Port: 8001              │
│  ├── /api/intel     - Dropstab, CryptoRank scrapers             │
│  ├── /api/news      - 26+ RSS news sources                      │
│  ├── /api/graph     - Knowledge Graph (projects, funds, tokens) │
│  ├── /api/sentiment - FOMO sentiment analysis                   │
│  └── /api/market    - DefiLlama + Binance market data          │
├─────────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                     Port: 27017             │
│  └── Collections: intel_*, news_*, graph_*, sentiment_*        │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Health & Auth
- `GET /api/health` - Service health check
- `POST /api/auth/verify` - Password verification

### Intel (Dropstab + CryptoRank)
- `GET /api/intel/stats` - Collection counts
- `POST /api/intel/dropstab/sync/all` - Sync Dropstab data
- `POST /api/intel/cryptorank/sync/all` - Sync CryptoRank data

### Knowledge Graph
- `GET /api/graph/stats` - Graph statistics
- `POST /api/graph/rebuild` - Full graph rebuild
- `GET /api/graph/network` - Get network for visualization
- `GET /api/graph/search?q=query` - Search nodes

### Market Data
- `GET /api/market/quote?asset=BTC` - Single asset quote
- `GET /api/market/quotes?assets=BTC,ETH` - Bulk quotes

### Sentiment
- `POST /api/sentiment/analyze` - Analyze text sentiment

## Access Credentials
- Frontend Password: `fomo2024`
- URL: https://data-parser-boot.preview.emergentagent.com

## Prioritized Backlog

### P0 (DONE)
- [x] Clone and setup repository
- [x] Install dependencies
- [x] Build NestJS backend
- [x] Start services
- [x] Run graph/rebuild
- [x] Run Dropstab/CryptoRank sync

### P1 (Next)
- [ ] Add scheduler for auto-sync
- [ ] WebSocket for real-time updates
- [ ] More scraping endpoints (listings, launchpads)

### P2 (Future)
- [ ] Telegram bot for alerts
- [ ] Advanced sentiment (LLM integration)
- [ ] Historical data tracking
