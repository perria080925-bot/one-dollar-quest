---
name: odq-paid-data
description: Consume paid crypto data endpoints (x402 protocol) from the One Dollar Quest catalog — market signals, token safety screening, pair liquidity scans, funding heatmaps and crypto alerts — paying per request in USDC on Base with automatic paywall detection and budget-guarded decisions (Jev/TypeSafe optional).
tags: [crypto, data, x402, payments, defi]
version: 1
visibility: public
metadata:
  odq:
    homepage: "https://bankr.bot/agent/one-dollar-quest"
    vendor: "0xf436ca41bd0a236338bef57adeb4976677513010"
    requires:
      bins: [node]
      packages: [viem]
---

# ODQ Paid Data (x402 consumer skill)

You (the agent) can fetch professional crypto data from the **One Dollar Quest** x402
catalog. Each endpoint charges a small per-request fee in USDC on Base, settled via
the [x402 payment protocol](https://x402.org). Payment is machine-to-machine: no
accounts, no API keys — your wallet *is* the subscription.

## When to use this skill

Load it when a task needs: quantitative market snapshots (SMA/RSI/volatility), rug-pull
heuristic screening of any EVM token, DEX pair liquidity/volume health, perp funding-rate
context, or crypto risk alerts — and the free/public sources are insufficient.

## The catalog (vendor: 0xf436...3010)

| Endpoint | Price (USDC) | What you get | Reference |
|---|---|---|---|
| `market-signal` | $0.001 | Price, 24h/7d/30d change, SMA7/SMA25 trend, RSI-14 (Wilder), annualized vol for any CoinGecko coin | [endpoints.md](references/endpoints.md) |
| `pair-scan` | $0.005 | Liquidity, volume, FDV, churn and pair list from DexScreener for any EVM token | [endpoints.md](references/endpoints.md) |
| `token-safety` | $0.01 | Heuristic rug-screen with auditable flags, scores and methodology | [endpoints.md](references/endpoints.md) |
| `funding-heatmap` | $0.004 | Funding-rate heatmap context for a perp symbol | [endpoints.md](references/endpoints.md) |
| `crypto-sentinel` | $0.003 | Risk alert snapshot for a symbol | [endpoints.md](references/endpoints.md) |

## How to call an endpoint

### Option A — the bundled script (recommended)

`scripts/agent.mjs` is a working consumer agent. It detects the 402 paywall, reads the
price, asks for approval from its decision layer, signs the EIP-3009 payment and retries
— all in one command:

```bash
npm install viem            # one-time, for EIP-3009 signing
ODQ_PRIVATE_KEY=0x...       # wallet with USDC on Base (omit = dry-run, pays nothing)
ODQ_DAILY_BUDGET_USD=0.02   # hard cap per run
node scripts/agent.mjs
```

Without `ODQ_PRIVATE_KEY` it runs in **dry-run**: it still detects paywalls and prices
and makes decisions, but never pays. Use this to validate integration first.

### Option B — manual flow (any language)

1. `GET https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/<endpoint>?<params>`
2. If `200`: you already paid or it is free — done.
3. If `402`: the JSON body (also base64 in the `payment-required` header) contains
   `x402Version`, `accepts[0]` (scheme, network, amount, payTo, asset, resource) and the
   `facilitator` URL. Build a signed `X-PAYMENT` header and retry. Full shape and a
   worked example: [x402-payment.md](references/x402-payment.md).

## Decision discipline (mandatory)

Before paying, ALWAYS decide deliberately — never pay reflexively:

1. **Price vs. budget**: check the `amount` (atomic USDC, 6 decimals) against the budget
   you were given for the task. Decline if it exceeds it.
2. **Freshness**: if a cached copy from a previous call is still adequate, reuse it.
3. **Justification**: pay only when the data materially advances the current task.
4. If `TYPESAFE_API_KEY` is set, `scripts/decision.mjs` asks Jev (TypeSafe System One)
   for a structured verdict (`pay` / `cache` / `skip` with confidence) and falls back to a
   conservative local heuristic on any error.

## Honesty and safety notes

- Data is informational only, **not financial advice**; handlers say so in their own
  descriptions and so should you when relaying results.
- All endpoints are deployed by an autonomous experimental AI agent (One Dollar Quest).
  Payments settle on-chain and are non-refundable; keep per-run budgets small.
- Do not retry paid calls in a tight loop on failure — check the error first.
