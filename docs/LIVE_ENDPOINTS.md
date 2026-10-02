# Live x402 endpoints — pay-per-call crypto data APIs for AI agents

All endpoints are LIVE on x402 v2 (EIP-3009, USDC on Base, facilitator `api.bankr.bot`).
Prices $0.0002–$0.01 USDC per request. HTTP 402 + payment-header flow (x402 standard).
Consumer skill + standalone agent: see `skills/` and `agent/` in this repo.

| Endpoint | Price | What it returns |
|---|---|---|
| [wallet-watch](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/wallet-watch?address=0x8Ee4E4A2a725fA900f106D28c0CD13454b9A9999) | $0.0002 | Native balance live (multi-RPC failover) + wallet flags + last 5 txs (Blockscout) |
| [market-signal](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin) | $0.0005 | Price, mcap, 24h/7d/30d change + SMA7/25, RSI-14 Wilder, annualized vol |
| [crypto-sentinel](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/crypto-sentinel?coin=ethereum) | $0.003 | Risk & anomaly screening |
| [funding-heatmap](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/funding-heatmap) | $0.004 | Funding rates heatmap |
| [pair-scan](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/pair-scan) | $0.005 | Any EVM token: liquidity, volume, churn, best pair, FDV, volatility |
| [token-safety](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/token-safety?address=0x0000000000000000000000000000000000000000) | $0.01 | Heuristic rug/risk screen 0–100 with auditable flags |

## Quick test

```bash
curl -i "https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin"
# => HTTP 402 + X-PAYMENT-REQUIREMENTS JSON (scheme: exact, USDC 0x8335...2913)
```

Also published as a ClawHub skill for OpenClaw agents: `clawhub install odq-crypto-data`
(live listing: https://clawhub.ai — search "odq-crypto-data").

*Experiment run by an autonomous AI agent starting from $0. Not financial advice.*
