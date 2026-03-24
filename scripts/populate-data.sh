#!/bin/bash
#
# FOMO Platform - Data Population Script
# Populates MongoDB with initial data from all sources
#

set -e

API_URL="${API_URL:-http://localhost:8001}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[POPULATE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "           FOMO Platform - Data Population"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
HEALTH=$(curl -s "$API_URL/api/health" 2>/dev/null || echo "")
if ! echo "$HEALTH" | grep -q '"ok":true'; then
  warn "Backend not responding at $API_URL"
  warn "Please start the backend first: sudo supervisorctl restart backend"
  exit 1
fi

log "Backend is healthy"
echo ""

# 1. Build Knowledge Graph
log "Step 1/4: Building Knowledge Graph..."
echo "This creates nodes for projects, funds, investors, tokens..."
RESULT=$(curl -s -X POST "$API_URL/api/graph/rebuild")
if echo "$RESULT" | grep -q '"status":"success"'; then
  NODE_COUNT=$(echo "$RESULT" | grep -o '"node_count":[0-9]*' | cut -d: -f2)
  EDGE_COUNT=$(echo "$RESULT" | grep -o '"edge_count":[0-9]*' | cut -d: -f2)
  log "✓ Graph built: $NODE_COUNT nodes, $EDGE_COUNT edges"
else
  warn "Graph rebuild may have issues: $RESULT"
fi
echo ""

# 2. Sync Dropstab Data
log "Step 2/4: Syncing Dropstab data..."
echo "Scraping coins, investors, fundraising rounds..."
RESULT=$(curl -s -X POST "$API_URL/api/intel/dropstab/sync/all" --max-time 300)
if echo "$RESULT" | grep -q '"ok":true'; then
  log "✓ Dropstab sync complete"
  echo "$RESULT" | head -c 300
  echo ""
else
  warn "Dropstab sync may have partial results"
fi
echo ""

# 3. Sync CryptoRank Data
log "Step 3/4: Syncing CryptoRank data..."
echo "Scraping funding data, investor portfolios..."
RESULT=$(curl -s -X POST "$API_URL/api/intel/cryptorank/sync/all" --max-time 300)
if echo "$RESULT" | grep -q '"ok":true'; then
  log "✓ CryptoRank sync complete"
else
  warn "CryptoRank sync may have partial results"
fi
echo ""

# 4. Sync News
log "Step 4/4: Syncing news from 26+ sources..."
RESULT=$(curl -s -X POST "$API_URL/api/news/sync/all" --max-time 120)
if echo "$RESULT" | grep -q '"ok":true'; then
  log "✓ News sync complete"
else
  warn "News sync may have partial results"
fi
echo ""

# Final stats
log "Fetching final statistics..."
echo ""

STATS=$(curl -s "$API_URL/api/intel/stats")
echo "Intel Collections:"
echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  {k}: {v}') for k,v in d.get('stats',{}).items()]" 2>/dev/null || echo "$STATS"

echo ""
GRAPH_STATS=$(curl -s "$API_URL/api/graph/stats")
echo "Knowledge Graph:"
echo "$GRAPH_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Nodes: {d.get(\"total_nodes\",0)}'); print(f'  Edges: {d.get(\"total_edges\",0)}')" 2>/dev/null || echo "$GRAPH_STATS"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Data population complete!"
echo "════════════════════════════════════════════════════════════════"
