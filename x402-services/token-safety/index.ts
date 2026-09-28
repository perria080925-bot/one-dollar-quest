// token-safety — x402 paid endpoint by an autonomous AI agent.
// Heuristic rug/risk screen for an EVM token using DexScreener public data.
// Transparent rule-based scoring: every flag is returned so the caller can audit it.
// This is NOT a security audit and NOT financial advice. Heuristics only.
export default async function handler(req: Request) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  const chain = (url.searchParams.get("chain") ?? "").trim().toLowerCase();

  if (!/^0x[a-fA-F0-9]{40}$/.test(token)) {
    return Response.json(
      { error: "invalid_token_address", hint: "pass a 0x-prefixed 40-hex EVM token address" },
      { status: 400 }
    );
  }

  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    return Response.json({ error: "upstream_error", status: res.status }, { status: 502 });
  }
  const data = await res.json();
  let pairs = Array.isArray(data?.pairs) ? data.pairs : [];
  if (chain) pairs = pairs.filter((p: any) => String(p.chainId).toLowerCase() === chain);
  if (pairs.length === 0) {
    return Response.json({ error: "no_pairs_found", token, chain: chain || "all" }, { status: 404 });
  }

  const num = (v: any) => (typeof v === "number" && isFinite(v) ? v : null);
  const best = [...pairs].sort((a: any, b: any) => (num(b?.liquidity?.usd) ?? 0) - (num(a?.liquidity?.usd) ?? 0))[0];

  const liq = num(best?.liquidity?.usd) ?? 0;
  const vol24 = num(best?.volume?.h24) ?? 0;
  const ageMs = best?.pairCreatedAt ? Date.now() - best.pairCreatedAt : null;
  const ageHours = ageMs !== null ? Math.max(0, ageMs / 3600000) : null;
  const churn = liq > 0 ? vol24 / liq : null;
  const m5 = num(best?.priceChange?.m5);
  const h1 = num(best?.priceChange?.h1);
  const buys = num(best?.txns?.h24?.buys) ?? 0;
  const sells = num(best?.txns?.h24?.sells) ?? 0;
  const totalTx = buys + sells;

  const flags: string[] = [];
  let score = 0; // higher = riskier

  if (ageHours !== null && ageHours < 24) { flags.push("PAIR_YOUNGER_THAN_24H"); score += 25; }
  else if (ageHours !== null && ageHours < 168) { flags.push("PAIR_YOUNGER_THAN_7D"); score += 10; }

  if (liq < 10000) { flags.push("LIQUIDITY_BELOW_10K"); score += 25; }
  else if (liq < 50000) { flags.push("LIQUIDITY_BELOW_50K"); score += 10; }

  if (churn !== null && churn > 5) { flags.push("EXTREME_VOLUME_CHURN_GT_5X"); score += 15; }
  else if (churn !== null && churn > 2) { flags.push("HIGH_VOLUME_CHURN_GT_2X"); score += 7; }

  if (m5 !== null && Math.abs(m5) >= 30) { flags.push("PRICE_MOVE_5M_GT_30PCT"); score += 12; }
  if (h1 !== null && Math.abs(h1) >= 60) { flags.push("PRICE_MOVE_1H_GT_60PCT"); score += 12; }

  if (totalTx > 0 && buys / totalTx > 0.85) { flags.push("BUY_PRESSURE_GT_85PCT"); score += 8; }
  if (totalTx > 0 && sells / totalTx > 0.8) { flags.push("SELL_PRESSURE_GT_80PCT"); score += 10; }
  if (totalTx < 50) { flags.push("VERY_LOW_TX_COUNT_24H"); score += 8; }

  if (pairs.length === 1) { flags.push("SINGLE_PAIR_ONLY"); score += 5; }
  if (!num(best?.fdv)) { flags.push("FDV_UNKNOWN"); score += 3; }

  score = Math.min(100, score);
  const level = score >= 60 ? "high_risk" : score >= 30 ? "elevated_risk" : "normal_range";

  return {
    token: {
      address: token,
      symbol: best?.baseToken?.symbol ?? null,
      name: best?.baseToken?.name ?? null,
    },
    screened_pair: { chain: best?.chainId, dex: best?.dexId, pair_address: best?.pairAddress },
    risk: {
      score_0_to_100: score,
      level,
      flags,
      flag_count: flags.length,
    },
    inputs_used: {
      liquidity_usd: liq || null,
      volume_24h_usd: vol24 || null,
      churn_24h: churn !== null ? Math.round(churn * 1000) / 1000 : null,
      pair_age_hours: ageHours !== null ? Math.round(ageHours * 100) / 100 : null,
      price_change_m5_pct: m5,
      price_change_h1_pct: h1,
      buys_24h: buys,
      sells_24h: sells,
      pairs_found: pairs.length,
    },
    methodology: "Rule-based heuristics on DEX market data: pair age, liquidity depth, volume churn, price volatility, tx imbalance. No contract-level analysis performed.",
    disclaimer: "Heuristic screen only. NOT a security audit. Can miss rugs and flag safe tokens. Never financial advice. DYOR.",
    generated_at: new Date().toISOString(),
  };
}
