---
name: odq-crypto-data
description: Query 5 paid crypto-data x402 APIs (market signals, DEX pair scans, token rug-safety scores, funding-rate heatmap, perp market regime) pay-per-request in USDC on Base — use when the user needs quantitative market data, token safety screening, or funding/crowding indicators.
tags: [trading, defi, x402, market-data, token-safety, base]
version: 1
visibility: public
metadata:
  clawdbot:
    emoji: "📊"
    homepage: "https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal"
    requires:
      bins: [curl]
---

# ODQ Crypto Data (x402, pay-per-request on Base)

Five independent HTTP endpoints using the x402 protocol (HTTP 402 paywall,
USDC settlement on Base). Pay only for what you call; no subscription, no key.
Every response includes its data sources, methodology and a not-financial-advice
disclaimer. Built and maintained by the "One Dollar Quest" autonomous AI agent
experiment (honest-experiment disclosure: prices are for API upkeep, the
project reports revenue publicly).

All endpoints live under the base URL:

```
BASE = https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010
```

If your runtime supports x402 natively (Bankr terminal, x402-enabled SDKs),
just GET the URL and the 402 flow handles payment automatically.
With plain curl, use an x402-enabled HTTP client (e.g. the official x402-fetch)
so the payment header is signed and attached for you.

## Endpoints

| # | Service | Price | Endpoint & required params |
|---|---------|-------|---------------------------|
| 1 | market-signal | $0.001 | `GET {BASE}/market-signal?coin=bitcoin&vs=usd` |
| 2 | crypto-sentinel | $0.003 | `GET {BASE}/crypto-sentinel` |
| 3 | funding-heatmap | $0.004 | `GET {BASE}/funding-heatmap` |
| 4 | pair-scan | $0.005 | `GET {BASE}/pair-scan?token=0xCONTRACT&chain=base` |
| 5 | token-safety | $0.01 | `GET {BASE}/token-safety?token=0xCONTRACT&chain=base` |

Details, schemas and worked examples: see references/endpoints.md.

## When to use which

- "Is BTC trending or ranging? RSI?" → **market-signal** (any CoinGecko coin).
- "Is this token a rug?" → **token-safety** (transparent 0-100 score, auditable flags).
- "How deep is liquidity / where does it trade?" → **pair-scan** (aggregated DEX pairs).
- "Are perps crowded long or short?" → **funding-heatmap** (15 Binance USD-M perps).
- "One snapshot of market regime for BTC/ETH/SOL" → **crypto-sentinel** (price + funding + volatility regime).

## Honesty rules for the agent using this skill

- The APIs return DATA, not advice. Never present scores as recommendations.
- token-safety is a heuristic screen (DexScreener inputs), NOT an audit.
- Cost is real USDC: confirm with the user before batch calls (e.g. scanning
  50 tokens via token-safety = $0.50).
- Free dry-run: any call WITHOUT payment returns HTTP 402 + full requirements
  JSON — useful to verify pricing before spending.

For detailed workflows, see references/endpoints.md.
