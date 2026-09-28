// market-signal — paid x402 endpoint deployed by an autonomous AI agent.
// Purpose: crypto market snapshot + quantitative momentum signals for a coin.
// Data source: CoinGecko public free API (no key). Compute: SMA, RSI-14, volatility.
// No promises of profitability. Purely informational/analytical output.
export default async function handler(req: Request) {
  const url = new URL(req.url);
  const coin = (url.searchParams.get("coin") ?? "bitcoin").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const vs = (url.searchParams.get("vs") ?? "usd").toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1) Current market data
  const mRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&ids=${coin}&price_change_percentage=24h,7d,30d`,
    { headers: { accept: "application/json" } }
  );
  if (!mRes.ok) {
    return Response.json({ error: "market_data_unavailable", upstream_status: mRes.status }, { status: 502 });
  }
  const mArr = await mRes.json();
  if (!Array.isArray(mArr) || mArr.length === 0) {
    return Response.json({ error: "unknown_coin", hint: "use a CoinGecko id, e.g. bitcoin, ethereum, solana" }, { status: 404 });
  }
  const m = mArr[0];

  // 2) 60 days of daily prices for indicators
  const hRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=${vs}&days=60&interval=daily`,
    { headers: { accept: "application/json" } }
  );
  let indicators: any = null;
  if (hRes.ok) {
    const h = await hRes.json();
    const prices: number[][] = h.prices ?? [];
    const closes = prices.map((p) => p[1]);
    if (closes.length >= 15) {
      const sma = (n: number) => closes.slice(-n).reduce((a, b) => a + b, 0) / n;
      const sma7 = sma(7);
      const sma25 = closes.length >= 25 ? sma(25) : null;

      // RSI-14 (Wilder's)
      let gains = 0, losses = 0;
      const last = closes.slice(-15);
      for (let i = 1; i < last.length; i++) {
        const d = last[i] - last[i - 1];
        if (d >= 0) gains += d; else losses -= d;
      }
      const avgG = gains / 14, avgL = losses / 14;
      const rsi = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);

      // Daily log-return volatility (annualized, sqrt(365))
      const rets: number[] = [];
      const r = closes.slice(-31);
      for (let i = 1; i < r.length; i++) rets.push(Math.log(r[i] / r[i - 1]));
      const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
      const volAnnual = Math.sqrt(variance * 365) * 100;

      indicators = {
        sma7: sma7,
        sma25: sma25,
        trend: sma25 === null ? null : sma7 > sma25 ? "up" : "down",
        rsi14: Math.round(rsi * 100) / 100,
        rsi_zone: rsi >= 70 ? "overbought" : rsi <= 30 ? "oversold" : "neutral",
        vol_annualized_pct: Math.round(volAnnual * 100) / 100,
        closes_used: closes.length,
      };
    }
  }

  return {
    coin: { id: m.id, symbol: m.symbol, name: m.name },
    vs_currency: vs,
    price: m.current_price,
    market_cap: m.market_cap,
    market_cap_rank: m.market_cap_rank,
    volume_24h: m.total_volume,
    change_24h_pct: m.price_change_percentage_24h_in_currency,
    change_7d_pct: m.price_change_percentage_7d_in_currency,
    change_30d_pct: m.price_change_percentage_30d_in_currency,
    indicators,
    disclaimer: "Informational only. Not financial advice. No profitability promise.",
    generated_at: new Date().toISOString(),
  };
}
