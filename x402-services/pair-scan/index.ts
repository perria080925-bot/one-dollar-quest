// pair-scan — x402 paid endpoint by an autonomous AI agent.
// Input: EVM token address (+ optional chain filter). Output: aggregated DEX pair data.
// Source: DexScreener public API (free). No investment advice, raw data + aggregates only.
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
  const top = [...pairs].sort((a: any, b: any) => (num(b?.liquidity?.usd) ?? 0) - (num(a?.liquidity?.usd) ?? 0));

  const totalLiquidity = pairs.reduce((s: number, p: any) => s + (num(p?.liquidity?.usd) ?? 0), 0);
  const totalVol24h = pairs.reduce((s: number, p: any) => s + (num(p?.volume?.h24) ?? 0), 0);

  return {
    token: {
      address: token,
      symbol: top[0]?.baseToken?.symbol ?? null,
      name: top[0]?.baseToken?.name ?? null,
    },
    chain_filter: chain || "all",
    pairs_found: pairs.length,
    dexes: [...new Set(pairs.map((p: any) => p.dexId).filter(Boolean))],
    aggregate: {
      total_liquidity_usd: Math.round(totalLiquidity * 100) / 100,
      total_volume_24h_usd: Math.round(totalVol24h * 100) / 100,
      churn_24h: totalLiquidity > 0 ? Math.round((totalVol24h / totalLiquidity) * 1000) / 1000 : null,
    },
    best_pair: {
      chain: top[0]?.chainId,
      dex: top[0]?.dexId,
      pair_address: top[0]?.pairAddress,
      price_usd: num(top[0]?.priceUsd) ?? (top[0]?.priceUsd ? parseFloat(top[0].priceUsd) : null),
      liquidity_usd: num(top[0]?.liquidity?.usd),
      fdv_usd: num(top[0]?.fdv),
      volume: {
        h24: num(top[0]?.volume?.h24),
        h6: num(top[0]?.volume?.h6),
        h1: num(top[0]?.volume?.h1),
      },
      price_change_pct: {
        m5: num(top[0]?.priceChange?.m5),
        h1: num(top[0]?.priceChange?.h1),
        h6: num(top[0]?.priceChange?.h6),
        h24: num(top[0]?.priceChange?.h24),
      },
      txns_24h: top[0]?.txns?.h24
        ? { buys: num(top[0].txns.h24.buys), sells: num(top[0].txns.h24.sells) }
        : null,
      created_at: top[0]?.pairCreatedAt ? new Date(top[0].pairCreatedAt).toISOString() : null,
    },
    other_pairs: top.slice(1, 6).map((p: any) => ({
      chain: p?.chainId,
      dex: p?.dexId,
      liquidity_usd: num(p?.liquidity?.usd),
      volume_h24: num(p?.volume?.h24),
      price_change_h24_pct: num(p?.priceChange?.h24),
    })),
    disclaimer: "Raw DEX data aggregation. Informational only. Not financial advice.",
    generated_at: new Date().toISOString(),
  };
}
