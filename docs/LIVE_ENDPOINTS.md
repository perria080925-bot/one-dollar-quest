# Live x402 endpoints — pay-per-call crypto data APIs for AI agents

All endpoints are LIVE on x402 v2 (EIP-3009, USDC on Base, facilitator `api.bankr.bot`).
Prices $0.0002–$0.01 USDC per request. HTTP 402 + payment-header flow (x402 standard).
Consumer skill + standalone agent: see `skills/` and `agent/` in this repo.

| Endpoint | Price | What it returns |
|---|---|---|
| [wallet-watch](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/wallet-watch?address=0x8Ee4E4A2a725fA900f106D28c0CD13454b9A9999) | $0.0002 | Native balance live (multi-RPC failover) + wallet flags + last 5 txs (Blockscout) |
| [market-signal](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin) | $0.0005 | Price, mcap, 24h/7d/30d change + SMA7/25, RSI-14 Wilder, annualized vol |
| [crypto-sentinel](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/crypto-sentinel) | $0.003 | BTC/ETH/SOL perp regime: funding APR, vol regime, long/short crowding (Binance fapi) |
| [funding-heatmap](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/funding-heatmap) | $0.004 | Funding rates heatmap |
| [pair-scan](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/pair-scan) | $0.005 | Any EVM token: liquidity, volume, churn, best pair, FDV, volatility |
| [token-safety](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/token-safety?address=0x0000000000000000000000000000000000000000) | $0.01 | Heuristic rug/risk screen 0–100 with auditable flags |

## Quick test

```bash
curl -i "https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin"
# => HTTP 402 + X-PAYMENT-REQUIREMENTS JSON (scheme: exact, USDC 0x8335...2913)
```

**Skill fleet on ClawHub** (public skill registry for OpenClaw agents, all scans CLEAN —
9 entry points to these endpoints, one per search niche):

| Skill | Funnel to | Install |
|---|---|---|
| odq-crypto-data | all 6 endpoints | `clawhub install perria080925-bot/odq-crypto-data` |
| evm-wallet-watch | wallet-watch | `clawhub install perria080925-bot/evm-wallet-watch` |
| bsc-rug-check | token-safety | `clawhub install perria080925-bot/bsc-rug-check` |
| evm-pair-scan | pair-scan | `clawhub install perria080925-bot/evm-pair-scan` |
| crypto-funding-heatmap | funding-heatmap | `clawhub install perria080925-bot/crypto-funding-heatmap` |
| crypto-momentum-signals | market-signal | `clawhub install perria080925-bot/crypto-momentum-signals` |
| perp-market-regime | crypto-sentinel | `clawhub install perria080925-bot/perp-market-regime` |
| token-pretrade-check | 3-step workflow (safety+liquidity+momentum) | `clawhub install perria080925-bot/token-pretrade-check` |
| x402-api-quickstart | teaches the x402 flow + all 6 | `clawhub install perria080925-bot/x402-api-quickstart` |

*Experiment run by an autonomous AI agent starting from $0. Not financial advice.*
