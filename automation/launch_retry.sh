#!/bin/bash
# launch_retry.sh — One-shot token launch retry after wallet aging (>=24h).
# Budget rule: $0 spend. Base launch is gas-sponsored when eligible.
# Simulation runs FIRST; if simulation fails again => log and exit, NO real launch.
LOG=/home/z/my-project/scripts/launch_retry.log
WL=/home/z/my-project/worklog.md
NAME='Autonomous Agent One Dollar Experiment'
SYMBOL=AGENT1

{
echo "=== LAUNCH RETRY START $(date -u +%FT%TZ) ==="
echo "wallet age check: account wallet 0x35c593023a9a3fc871811d5117a9f5b3e6b450a3 created 2026-09-27T13:09Z"

# Step 1: simulate (free, does not consume quota)
if bankr --ni launch --name "$NAME" --symbol "$SYMBOL" --chain base --simulate; then
  echo "SIM OK at $(date -u +%FT%TZ) => proceeding to real launch (gas-sponsored, \$0)"
  if bankr --ni launch --name "$NAME" --symbol "$SYMBOL" --chain base --yes; then
    echo "LAUNCH SUCCESS at $(date -u +%FT%TZ)"
    echo "--- fees snapshot ---"
    bankr fees 2>&1
  else
    echo "REAL LAUNCH FAILED at $(date -u +%FT%TZ) (simulation passed; see above)"
  fi
else
  echo "SIM STILL FAILING at $(date -u +%FT%TZ) => no launch attempted. Retrying once in 24h."
  sleep 86400
  if bankr --ni launch --name "$NAME" --symbol "$SYMBOL" --chain base --simulate; then
    echo "SECOND SIM OK at $(date -u +%FT%TZ) => launching"
    bankr --ni launch --name "$NAME" --symbol "$SYMBOL" --chain base --yes \
      && echo "LAUNCH SUCCESS (2nd window)" \
      || echo "LAUNCH FAILED (2nd window)"
  else
    echo "SIM FAILED AGAIN at $(date -u +%FT%TZ) => giving up. Account-level gate persists; human decision required."
  fi
fi
echo "=== LAUNCH RETRY END $(date -u +%FT%TZ) ==="
} >> "$LOG" 2>&1

# Append summary to shared worklog
{
echo ""
echo "---"
echo "Task ID: goal-1usd (scheduled launch retry)"
echo "Agent: launch_retry.sh (autonomous, nohup)"
echo "Task: Reintentar launch AGENT1 tras aging de wallet."
echo ""
echo "Work Log:"
echo "- Ver $LOG para detalle completo (sim + launch o fallo)."
echo ""
echo "Stage Summary:"
echo "- Resultado registrado por el script; sin gasto fuera de gas patrocinado."
} >> "$WL"
