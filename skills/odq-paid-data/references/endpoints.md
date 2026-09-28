# Endpoint Reference — ODQ x402 catalog

Base URL: `https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010`

All endpoints: `GET`, payment in USDC on Base (0x8335...2913), x402 v2, facilitator
`https://api.bankr.bot/facilitator`. Prices below are the configured `price`; verify the
live `amount` from each 402 response before paying.

## 1. market-signal — $0.001

`GET /market-signal?coin=bitcoin&vs=usd`

- `coin`: any CoinGecko coin id (e.g. `bitcoin`, `ethereum`, `solana`)
- `vs`: quote currency, default `usd`

Returns: price, 24h/7d/30d % change, market cap, total volume, SMA7/SMA25 with trend
(`up`/`down`/`flat`), RSI-14 (Wilder smoothing, with `overbought`/`oversold` zones),
annualized volatility, and a disclaimer.

Example decision value: timing checks before portfolio actions; cheap enough to poll
every few hours.

## 2. pair-scan — $0.005

`GET /pair-scan?token=<0xADDRESS>`

- `token`: any EVM token address (pairs are looked up on DexScreener)

Returns: number of pairs, aggregate liquidity, 24h/6h/1h volume, FDV, churn ratio, top
pairs with DEX names, and a liquidity-health assessment.

Example decision value: checking whether a token you were asked about has real,
concentrated-enough liquidity before discussing tradability.

## 3. token-safety — $0.01

`GET /token-safety?token=<0xADDRESS>&chain=base`

- `token`: EVM token address
- `chain`: optional (`base` default; supports chains covered by public RPCs)

Returns: heuristic rug-screen — liquidity concentration, sell-pressure flag,
buy/sell tax hints via bytecode markers, holder-count signal when public, a 0–100 risk
score bucket (`low`/`normal_range`/`elevated`/`high_risk`), each flag's rationale, and
the methodology block. It is a screen, not an audit.

Example decision value: pre-screening any token a user mentions before deeper analysis.

## 4. funding-heatmap — $0.004

`GET /funding-heatmap?symbol=BTC`

- `symbol`: perp base symbol (e.g. `BTC`, `ETH`)

Returns: funding-rate context snapshot with sign and magnitude framing, plus disclaimer.

## 5. crypto-sentinel — $0.003

`GET /crypto-sentinel?symbol=BTC`

- `symbol`: symbol to alert on

Returns: risk-alert snapshot combining public market fields with rule-based warnings.

## Error behavior

| Response | Meaning | What to do |
|---|---|---|
| `200` | Paid request accepted | Parse JSON body |
| `402` | Paywall (expected on first unpaid call) | Read `accepts[0]`, decide, pay and retry |
| `400` | Bad params (e.g. unknown coin id) | Fix params; do NOT retry paid without fixing |
| `429/5xx` | Upstream rate limit or outage | Back off; the x402 router only settles on success, so no funds moved |
