# FOMO Crypto Intelligence Platform v2.0

## Status: ✅ FULLY OPERATIONAL ON NESTJS

**Python backend completely removed. Platform runs on NestJS + Puppeteer + MongoDB.**

---

## CURRENT DATA (2026-03-24)

### Intel Collections
| Collection | Count | Source |
|------------|-------|--------|
| Investors | 23 | Dropstab + CryptoRank |
| Unlocks | 18 | CryptoRank |
| Fundraising | 17 | Dropstab + CryptoRank |
| Categories | 12 | CryptoRank |
| Projects | 3 | Dropstab |
| Activity | 3 | Dropstab |
| **Total** | **76** | |

### News Articles
| Tier | Sources | Articles |
|------|---------|----------|
| Tier A (Primary) | 9 | 175+ |
| Tier B (Secondary) | 12 | 144+ |
| Tier C (Research) | 5 | 21+ |
| **Total** | **26** | **358** |

### Knowledge Graph
- **Nodes: 149** (projects, funds, tokens, persons, exchanges, assets)
- **Edges: 457** (invested_in, has_token, traded_on, works_at, etc.)

---

## API DOCUMENTATION

### Intel Endpoints
```
GET  /api/intel/stats              - Collection statistics
GET  /api/intel/projects           - All projects
GET  /api/intel/investors          - All investors/funds
GET  /api/intel/unlocks            - Token unlock schedule
GET  /api/intel/fundraising        - Funding rounds
GET  /api/intel/funds              - Investment funds

--- Dropstab Scraper ---
GET  /api/intel/dropstab/scrape/coins
GET  /api/intel/dropstab/scrape/investors
GET  /api/intel/dropstab/scrape/fundraising
POST /api/intel/dropstab/sync/all

--- CryptoRank Scraper ---
GET  /api/intel/cryptorank/scrape/funding
GET  /api/intel/cryptorank/scrape/investors
GET  /api/intel/cryptorank/scrape/unlocks
POST /api/intel/cryptorank/sync/all
```

### News Endpoints
```
GET  /api/news/sources             - 26 RSS sources
GET  /api/news/stats               - Article statistics
GET  /api/news/fetch/:sourceId     - Fetch from source
POST /api/news/sync/all            - Sync all to MongoDB
GET  /api/news-intelligence/sources-registry
```

### Graph Endpoints
```
GET  /api/graph/stats              - Graph statistics
GET  /api/graph/network            - Full network
GET  /api/graph/search?q=query     - Search nodes
POST /api/graph/rebuild            - Rebuild graph
```

### Market Endpoints
```
GET  /api/market/quote?asset=BTC   - Single quote (DefiLlama)
GET  /api/market/quotes?assets=... - Multiple quotes
GET  /api/market/candles           - OHLCV candles
GET  /api/market/overview          - Global market
```

### Sentiment Endpoints
```
GET  /api/sentiment/status         - Engine status
POST /api/sentiment/analyze        - Analyze text
POST /api/sentiment/analyze/batch  - Batch analysis
```

---

## PARSER HIERARCHY

```
┌────────────────────────────────────────────────────────────────┐
│                      FOMO PARSER STACK                         │
├────────────────────────────────────────────────────────────────┤
│  TIER 1: Analytics Parsers (Puppeteer/SSR)                     │
│  ├── Dropstab   → coins, investors, fundraising                │
│  └── CryptoRank → funding, unlocks, categories                 │
├────────────────────────────────────────────────────────────────┤
│  TIER 2: News Parsers (RSS/XML)                                │
│  └── 26 sources → Tier A/B/C prioritization                    │
├────────────────────────────────────────────────────────────────┤
│  TIER 3: Market Providers (REST API)                           │
│  ├── DefiLlama   → quotes, TVL, overview ✅                    │
│  ├── Binance     → orderbook, trades ⚠️ (geo-blocked)         │
│  └── Bybit       → candles ⚠️ (geo-blocked)                   │
└────────────────────────────────────────────────────────────────┘
```

---

## QUICK START

```bash
# Start NestJS backend
cd /app/backend && PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node dist/main.js &

# Full data sync
curl -X POST http://localhost:8001/api/intel/dropstab/sync/all
curl -X POST http://localhost:8001/api/intel/cryptorank/sync/all
curl -X POST http://localhost:8001/api/news/sync/all
curl -X POST http://localhost:8001/api/graph/rebuild
```

## ACCESS
- **URL**: https://data-parser-boot.preview.emergentagent.com
- **Password**: `fomo2024`

---

## BACKLOG

### P1 - High Priority
- [ ] Add @nestjs/schedule for auto-sync (cron jobs)
- [ ] Add CoinGecko/CMC API for market data (bypass geo-blocks)
- [ ] Fix Intelligence Engines (Correlation, Trust, Query)

### P2 - Medium Priority
- [ ] WebSocket real-time updates
- [ ] Telegram bot for alerts
- [ ] Historical data tracking

### P3 - Nice to Have
- [ ] More exchange adapters
- [ ] Export functionality
- [ ] Advanced filtering
