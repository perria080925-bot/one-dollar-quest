# ODQ Revenue Research Program

> Adaptation of @karpathy/autoresearch methodology to the One Dollar Quest objective:
> autonomous, measurable iteration toward real revenue. The agent experiments on its own
> revenue-generating levers the way autoresearch experiments on model weights.

## Fixed harness (equivalent of `prepare.py` — READ-ONLY, never modified)

- Budget rule: $0 spending without explicit human approval. No leverage. No wash trading.
- Honesty rule: every token/endpoint carries AI-agent disclosure; no promises of returns.
- Security rule: no secrets in the repo; wallet recipients locked; budget caps on all spend.
- Ground-truth metric (the `val_bpb` of this project): **cumulative real revenue in USD**,
  read from: bankr portfolio total + kibi fees (BNB→USD) + x402 request revenue.
  Secondary metrics (not the goal, only diagnostics): x402 requests/week, token vol24h,
  profile views, content posts drafted.

## Editable levers (equivalent of `train.py` — the agent edits ONE at a time)

- x402 endpoint prices (5 endpoints, currently $0.001–$0.01)
- Token naming/narrative queue (trend-inspired, honest description always)
- Content cadence (drafts per day, formats ES/EN)
- Distribution surfaces (directory profile text, skill catalog PR, app listing)
- New endpoint ideas (only built when a prior experiment justified demand)

## The experiment loop

LOOP:

1. Pick ONE lever change (or run baseline if results.tsv is empty).
2. git commit the change to this repo (branch: `research/<tag>` optional; main is fine for now).
3. Let it run for the budget defined per experiment type:
   - pricing changes: 48h minimum
   - content cadence: 7 days
   - token naming: 1 launch cycle
4. Record outcome in `revenue_experiments.tsv`:
   `commit  revenue_usd  gas_spent_usd  status  description`
   (status: keep | discard | inconclusive; crashes/infra-failures → inconclusive, retry next cycle)
5. Simplicity criterion: a change that adds moving parts must beat the current config by a
   meaningful margin, otherwise discard it.

## Baseline (already running)

- Config: 5 x402 endpoints at listed prices · daily gas-sponsored token launches with
  platform fallback · kibi_monetizer 30-min loop (trend scan 6h, content 12h) · monitor_v2 2h loop.
- Starting revenue: $0.00 (2026-09-28).

## Queue of next experiments

1. E1 baseline: current config, measure 48h (in progress)
2. E2 price: cut market-signal from $0.001 → $0.0005 for 48h; hypothesis: crossing the
   "rounding error" threshold doubles request rate (needs a consumer to exist first — run
   only after the skill catalog PR lands)
3. E3 content: 12h → 6h cadence for 7 days; measure any profile/API uptick
4. E4 distribution: add 1 more directory listing (Kibi project update when approved)
5. E5 product: add wallet-watch endpoint ($0.002) if E2 shows price-elastic demand

## Constraints honored from the methodology

- One change per experiment. Fixed measurement window. results.tsv is append-only truth.
- Infra failures (Kibi RPC 403, deployer unfunded) do NOT count as experiment outcomes.
- Simplicity wins ties. The agent may delete levers that show zero signal after 2 windows.
