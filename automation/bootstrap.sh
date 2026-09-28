#!/bin/bash
# bootstrap.sh — Restore full working state after VM recycle.
# Idempotent: safe to run any time. Installs CLIs, re-auths, verifies assets.
export PATH="/home/z/.npm-global/bin:$PATH"
source /home/z/my-project/secrets/keys.env

echo "[bootstrap] $(date -u +%FT%TZ) starting"

# 1) CLIs
npm ls -g @bankr/cli >/dev/null 2>&1 || npm i -g @bankr/cli >/dev/null 2>&1
npm ls -g @kibibot/cli >/dev/null 2>&1 || npm i -g @kibibot/cli >/dev/null 2>&1

# 2) Auth
kibi config set apiKey "$KIBI_API_KEY" >/dev/null 2>&1 && echo "[bootstrap] kibi auth OK"
bankr --config /home/z/.bankr/user.json login --api-key "$BANKR_API_KEY" >/dev/null 2>&1 && echo "[bootstrap] bankr auth OK"

# 3) Verify assets
echo "[bootstrap] kibi identity:"; kibi whoami 2>&1 | grep -E "Twitter|Joined" | head -2
echo "[bootstrap] ZTOD check:"; kibi token info "$TOKEN_ZTOD_BSC" --chain bnb --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print('  ZTOD:', d.get('token_address'), '| price:', d.get('price_usd'))" 2>/dev/null
echo "[bootstrap] bankr x402 endpoints (stranded acct 0x35c5):"
for svc in market-signal pair-scan token-safety; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://x402.bankr.bot/0x35c593023a9a3fc871811d5117a9f5b3e6b450a3/$svc?coin=bitcoin&token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
  echo "  $svc => HTTP $CODE (402=live)"
done
echo "[bootstrap] done $(date -u +%FT%TZ)"

# 4) Relaunch persistent monitor if not running
if ! pgrep -f monitor_v2.sh >/dev/null 2>&1; then
  nohup /home/z/my-project/scripts/monitor_v2.sh >/dev/null 2>&1 &
  echo "[bootstrap] monitor_v2 relaunched (PID $!)"
else
  echo "[bootstrap] monitor_v2 already running"
fi
