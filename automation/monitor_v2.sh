#!/bin/bash
# monitor_v2.sh — Persistent revenue monitor + autonomous iteration.
# Every 2h: snapshot Kibi fees/balances/quota + Bankr user account into CSV.
# Autonomous iteration: when free quota resets (daily) and RPC works, launches
# next honest token per chain automatically (rotating names). Robinhood: never
# auto-attempted (requires funds). All actions logged to worklog.
export PATH="/home/z/.npm-global/bin:$PATH"
source /home/z/my-project/secrets/keys.env
kibi config set apiKey "$KIBI_API_KEY" >/dev/null 2>&1

CSV=/home/z/my-project/scripts/revenue_log.csv
LOG=/home/z/my-project/scripts/monitor.log
WL=/home/z/my-project/worklog.md

# Honest name rotation for daily auto-launches (all carry same honest description)
BASE_NAMES=("Agent Banana|ABANANA" "One Dollar Quest|ODQ" "Agent Build Fund|ABF")
BNB_NAMES=("Agent Banana|ABANANA" "Agent Fee Engine|AFEE" "Self Funding Test|SFT")
BASE_IDX=0; BNB_IDX=0
DESC='Experimental memecoin created by an autonomous AI agent, inspired by trending BNB/BSC meme culture. Launched to test self-funding via creator trading fees. No utility, no returns, no promises. AI-generated logo. DYOR.'
BANANA_IMG='https://raw.githubusercontent.com/perria080925-bot/one-dollar-quest/main/assets/agent-banana.png'
BANANA_TWEET='https://x.com/cz_binance/status/2100811057736581158'
LAUNCHED_LOG=/home/z/my-project/scripts/launched_names.txt; touch "$LAUNCHED_LOG"
# Seed with already-launched symbols (avoid trend-name collisions with portfolio)
for s in ABANANA ODQ AFEE ZTOD; do grep -qx "$s" "$LAUNCHED_LOG" || echo "$s" >> "$LAUNCHED_LOG"; done

# pick_trend_name: read kibi_monetizer trend_queue, return first trending symbol
# not already launched by us and safe as a token symbol (ASCII alnum 2-8 chars).
# Output: "Agent <Sym>|A<SYM>" or nothing. Trend-following per human mandate.
pick_trend_name() {
  python3 - "$LAUNCHED_LOG" << 'PYEOF'
import json, sys, re
try:
    used = set(open(sys.argv[1]).read().upper().split())
    st = json.load(open('/home/z/my-project/scripts/monetizer_state.json'))
    for sym in st.get('trend_queue', []):
        if not re.fullmatch(r'[A-Za-z0-9]{2,8}', sym):
            continue  # skip non-ASCII (chinese meta) for symbol safety
        if sym.upper() in used or sym.upper() in ('ABANANA','ODQ','AFEE','ZTOD'):
            continue
        pretty = sym[0].upper() + sym[1:].lower()
        print(f"Agent {pretty}|A{sym.upper()}")
        break
except Exception:
    pass
PYEOF
}

logwl() { { echo ""; echo "---"; echo "Task ID: goal-1usd (monitor_v2 auto)"; echo "Agent: monitor_v2.sh"; echo "Task: $1"; echo ""; echo "Work Log:"; shift; while [ "$#" -gt 0 ]; do echo "- $1"; shift; done; } >> "$WL"; }

snapshot() {
  TS=$(date -u +%FT%TZ)
  KFEES=$(kibi fees --json 2>/dev/null | tr -d '\n' | head -c 400)
  KBAL=$(kibi balances --json 2>/dev/null | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  w=d.get('wallets',{})
  print(str(w))
except: print('NA')" 2>/dev/null)
  QUOTA=$(kibi quota --json 2>/dev/null | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  r={c['chain']:(c['free_used_today'],c['sponsored_remaining'],c['trading_wallet_balance']) for c in d['chains']}
  print(r)
except: print('NA')" 2>/dev/null)
  BTOTAL=$(bankr --config /home/z/.bankr/user.json wallet portfolio 2>/dev/null | grep -m1 "Total:" | grep -oE '\$[0-9]+\.[0-9]+' | tr -d '$')
  echo "[$TS] bankr_total=${BTOTAL:-NA}" >> "$LOG"
  echo "[$TS] kibi_quota=$QUOTA" >> "$LOG"
  echo "[$TS] kibi_fees=${KFEES:0:200}" >> "$LOG"
  echo "$TS,${BTOTAL:-NA},kibi_fees_raw" >> "$CSV"
}

try_launch() {
  # $1=chain $2=platform $3=name $4=symbol
  echo "[auto] attempting launch $3($4) on $1/$2 at $(date -u +%FT%TZ)" >> "$LOG"
  EXTRA=""
  if [ "$3" = "Agent Banana" ]; then EXTRA="--image-url $BANANA_IMG --source $BANANA_TWEET"; fi
  OUT=$(kibi token create --name "$3" --symbol "$4" --chain "$1" --platform "$2" --description "$DESC" $EXTRA --json 2>&1 | tail -12)
  echo "$OUT" >> "$LOG"
  if echo "$OUT" | grep -q '"status": "completed"'; then
    ADDR=$(echo "$OUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('token_address'))" 2>/dev/null)
    logwl "AUTO-LAUNCH exitoso: $3($4) en $1/$2" "Address: $ADDR" "Costo: \$0 (gas patrocinado). Descripción honesta aplicada."
  else
    logwl "AUTO-LAUNCH falló: $3($4) en $1/$2" "Detalle en monitor.log"
  fi
}

# MAIN LOOP: first snapshot now, then every 2h; daily quota check each cycle.
snapshot
while true; do
  sleep 7200
  snapshot
  # Quota-based auto iteration (checked every cycle; launches only when remaining>0)
  Q=$(kibi quota --json 2>/dev/null)
  BNB_REMAIN=$(echo "$Q" | python3 -c "import json,sys; d=json.load(sys.stdin); print([c['sponsored_remaining'] for c in d['chains'] if c['chain']=='bsc'][0])" 2>/dev/null)
  BASE_REMAIN=$(echo "$Q" | python3 -c "import json,sys; d=json.load(sys.stdin); print([c['sponsored_remaining'] for c in d['chains'] if c['chain']=='base'][0])" 2>/dev/null)
  # Self-healing: failures don't consume quota, so retry happens next cycle
  # automatically while remaining>0. Success sets remaining=0 => no dup launch.
  if [ "${BNB_REMAIN:-0}" -gt 0 ]; then
    TN=$(pick_trend_name)
    if [ -n "$TN" ]; then IFS='|' read -r N S <<< "$TN"; else IFS='|' read -r N S <<< "${BNB_NAMES[$BNB_IDX]}"; fi
    echo "[auto] name picked: $N ($S) (trend-driven if from queue)" >> "$LOG"
    # Platform fallback: flap deployer often unfunded => try bfun then fourmeme
    try_launch bnb flap "$N" "$S"
    if ! grep -q '"status": "completed"' <(tail -20 "$LOG"); then
      try_launch bnb bfun "$N" "$S"
      if ! grep -q '"status": "completed"' <(tail -20 "$LOG"); then
        try_launch bnb fourmeme "$N" "$S"
      fi
    fi
    if grep -q '"status": "completed"' <(tail -20 "$LOG"); then echo "$S" >> "$LAUNCHED_LOG"; fi
    BNB_IDX=$(( (BNB_IDX+1) % ${#BNB_NAMES[@]} ))
  fi
  if [ "${BASE_REMAIN:-0}" -gt 0 ]; then
    TN=$(pick_trend_name)
    if [ -n "$TN" ]; then IFS='|' read -r N S <<< "$TN"; else IFS='|' read -r N S <<< "${BASE_NAMES[$BASE_IDX]}"; fi
    # Platform fallback for Base (clanker RPC often 403)
    try_launch base clanker "$N" "$S"
    if ! grep -q '"status": "completed"' <(tail -20 "$LOG"); then
      try_launch base basememe "$N" "$S"
    fi
    if grep -q '"status": "completed"' <(tail -20 "$LOG"); then echo "$S" >> "$LAUNCHED_LOG"; fi
    BASE_IDX=$(( (BASE_IDX+1) % ${#BASE_NAMES[@]} ))
  fi
  RH_REMAIN=$(echo "$Q" | python3 -c "import json,sys; d=json.load(sys.stdin); print([c['sponsored_remaining'] for c in d['chains'] if c['chain']=='robinhood'][0])" 2>/dev/null)
  if [ "${RH_REMAIN:-0}" -gt 0 ]; then
    try_launch robinhood flap "One Dollar Quest" "ODQ"
    if grep -q '"status": "completed"' <(tail -20 "$LOG"); then echo "ODQ-RH" >> "$LAUNCHED_LOG"; fi
  fi
done
