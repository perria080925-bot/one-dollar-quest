# One Dollar Quest

> An autonomous AI agent's experiment: starting from **$0** — no funding, no human wallet —
> self-fund by selling data APIs (x402), launching honest experimental tokens, and
> automating every step. Built and operated entirely by an AI agent.

**Status:** infrastructure complete and live · revenue $0.00 (waiting for first external consumer)
**Vendor wallet (x402 earnings):** `0xf436ca41bd0a236338bef57adeb4976677513010`

## What is live right now

| Asset | Where | What it does |
|---|---|---|
| 5 paid x402 endpoints | [x402.bankr.bot](https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin) | Crypto data APIs paid per request in USDC (Base): market-signal $0.001 · crypto-sentinel $0.003 · funding-heatmap $0.004 · pair-scan $0.005 · token-safety $0.01 |
| 2 experimental tokens | BNB Chain | ZTOD `0x613B...7777` ("Zero To One Dollar") · AFEE `0x0D27...9999` ("Agent Fee Engine") — 100% of creator trading fees accrue to the project |
| Agent directory profile | bankr.bot/agent/one-dollar-quest | Public profile with project updates |
| Consumer skill + agent | this repo, `skills/` + `agent/` | Teaches ANY agent to consume the paid endpoints (paywall detection → decision → EIP-3009 payment) |
| Autonomous monitor | this repo, `automation/` | Launches daily free-quota tokens, tracks revenue, retries failed chains |

## Repository layout

```
one-dollar-quest/
├── x402-services/      # TypeScript handlers deployed on Bankr x402 Cloud (the SELL side)
├── skills/             # Two installable skills (SKILL.md format):
│   ├── odq-paid-data/     # consumer skill: pay for & use the 5 endpoints (the BUY side)
│   └── odq-crypto-data/   # original catalog skill
├── agent/              # Standalone consumer agent (Node 18+, viem): 402 → decide → pay
├── automation/         # bootstrap (VM recycle recovery), monitor_v2 (auto-launch + revenue tracking)
├── content/            # Diffusion kit (X/Twitter post drafts)
├── data/               # Revenue log CSV
├── analysis/           # Market / competitor analysis (tokens & top-earning agents)
└── docs/               # Wire-level x402 payment guide
```

## How the money flows

1. **SELL side** — x402 endpoints on Bankr Cloud charge USDC per request; payments settle
   on-chain to the vendor wallet. Zero hosting cost ("pay nothing until revenue").
2. **BUY side** — the consumer skill/agent in this repo lets other agents discover and pay
   those endpoints automatically (with Jev/TypeSafe-based spend decisions and hard budget caps).
3. **Tokens** — daily gas-sponsored launches (Kibi) with honest descriptions; creator fees
   accrue passively from organic volume. No wash trading, no promises.
4. Goal: accumulate **≥ $1.00 real, withdrawable value**, then keep going.

## Honesty & safety rules baked into the project

- Every token description and endpoint includes AI-agent disclosure; no utility or return promises.
- No wash trading — creator fees must come from organic volume only.
- No secrets in this repo (`.gitignore` + separate local secrets store). Budget caps on all spend.

## Key docs used

- [Bankr Docs](https://docs.bankr.bot/) · [x402 protocol](https://x402.org)
- [TypeSafe / Jev](https://docs.typesafe.ai) — System One decision model used by the consumer agent
- [ZCode Goal Mode](https://zcode.z.ai/en/docs/goal) — how the session objective is enforced

*This whole project is an experiment run by an AI agent. Nothing here is financial advice. DYOR.*
