/**
 * ODQ Consumer Agent (x402)
 * =========================
 * An autonomous agent that CONSUMES paid x402 data services.
 * Flow per task: GET -> (402) -> decide (Jev/heuristic) -> sign EIP-3009
 * payment (USDC on Base) -> retry with X-PAYMENT -> log.
 *
 * Modes:
 *  - Full payment: requires ODQ_PRIVATE_KEY (wallet with USDC on Base).
 *  - Dry-run (default without funds): detects the paywall, computes the price,
 *    asks Jev, logs what it WOULD pay. Safe with $0 wallets.
 *
 * Env vars:
 *  ODQ_PRIVATE_KEY      private key with USDC on Base (optional; enables real payment)
 *  TYPESAFE_API_KEY     enables Jev (System One) decisions (optional)
 *  ODQ_DAILY_BUDGET_USD max USDC the agent may spend per run (default "0.02")
 *  ODQ_ONCE             "1" = run once and exit (default loop every ODQ_INTERVAL_MS)
 *  ODQ_INTERVAL_MS      loop interval (default 3600000 = 1h)
 *
 * x402 v2 payload shape (verified against live 402 from x402.bankr.bot):
 *  header X-PAYMENT = base64url(JSON):
 *  { x402Version:2, accepted:{scheme,network,amount,resource,payTo,maxTimeoutSeconds,asset,extra},
 *    payload:{ signature, authorization:{from,to,value,validAfter,validBefore,nonce} } }
 *  Signature = EIP-712 TransferWithAuthorization signed for the USDC domain
 *  { name:"USD Coin", version:"2", chainId:8453, verifyingContract:USDC }.
 */

import { createWalletClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { jevDecide, heuristicDecide } from "./decision.mjs";
import fs from "node:fs";
import path from "node:path";

// ---------------- config ----------------
const VENDOR = "0xf436ca41bd0a236338bef57adeb4976677513010"; // ODQ vendor wallet
const BASE_URL = `https://x402.bankr.bot/${VENDOR}`;
const BUDGET = Number(process.env.ODQ_DAILY_BUDGET_USD ?? "0.02");
const USDC_BASE = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const RUN_ONCE = process.env.ODQ_ONCE === "1";
const INTERVAL = Number(process.env.ODQ_INTERVAL_MS ?? 3600000);
const LOG = path.join(import.meta.dirname, "consumer_log.csv");

// The agent's "data needs": what it wants, why, and what it's worth.
const TASKS = [
  { name: "market-signal", params: "coin=bitcoin&vs=usd", priority: 3,
    reason: "macro momentum check to time any future position" },
  { name: "token-safety", params: "token=0x613B6c32bAFF797108417F0b653738547F5b7777", priority: 2,
    reason: "monitor safety flags of a token in our own portfolio (ZTOD, BSC)" },
  { name: "pair-scan", params: "token=0x613B6c32bAFF797108417F0b653738547F5b7777", priority: 2,
    reason: "track liquidity/volume health of portfolio token ZTOD" },
  { name: "funding-heatmap", params: "symbol=BTC", priority: 1,
    reason: "perp funding conditions snapshot" },
];

// ---------------- x402 helpers ----------------
function b64url(obj) { return Buffer.from(JSON.stringify(obj)).toString("base64url"); }

function parseRequirements(body) {
  // Works for x402 v2 (accepts) and tolerates v1 shapes.
  const req = (body?.accepts || body?.paymentRequirements || [])[0];
  if (!req) return null;
  return {
    version: body.x402Version ?? 1,
    scheme: req.scheme || "exact",
    network: req.network,                       // e.g. "eip155:8453"
    chainId: Number(String(req.network).split(":")[1] || 8453),
    amount: req.amount || req.maxAmountRequired, // atomic units (USDC: 6 dec)
    payTo: req.payTo,
    asset: req.asset,
    extra: req.extra || { name: "USD Coin", version: "2" },
    resource: req.resource,
    maxTimeoutSeconds: req.maxTimeoutSeconds || 60,
  };
}

function priceUsd(req) {
  try { return Number(formatUnits(BigInt(req.amount), 6)); } catch { return NaN; }
}

/** Build and sign the X-PAYMENT header (EIP-3009 exact scheme, EVM chains). */
async function signPayment(account, req) {
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: account.address,
    to: req.payTo,
    value: req.amount,
    validAfter: String(now - 600),
    validBefore: String(now + (req.maxTimeoutSeconds + 300)),
    nonce: "0x" + crypto.randomBytes(32).toString("hex"),
  };
  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };
  const domain = {
    name: req.extra?.name || "USD Coin",
    version: req.extra?.version || "2",
    chainId: req.chainId,
    verifyingContract: req.asset,
  };
  const signature = await account.signTypedData({ domain, types, primaryType: "TransferWithAuthorization", message: authorization });

  const accepted = {
    scheme: req.scheme, network: req.network, amount: req.amount,
    resource: req.resource, payTo: req.payTo, maxTimeoutSeconds: req.maxTimeoutSeconds,
    asset: req.asset, extra: req.extra,
  };
  const payload = { x402Version: req.version, accepted, payload: { signature, authorization } };
  return b64url(payload);
}

async function fetchWithPayment(url, { account, dryRun, spendRef }) {
  const res = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (res.status !== 402) return { res, paid: false };

  const body = await res.json().catch(() => ({}));
  const req = parseRequirements(body);
  if (!req) return { res, paid: false, error: "no valid accepts in 402" };
  const usd = priceUsd(req);
  spendRef.price = usd; spendRef.payTo = req.payTo;

  if (dryRun || !account) {
    spendRef.decision_note = "dry-run (no funded wallet configured)";
    return { res, paid: false, dryRun: true, req };
  }

  const xPayment = await signPayment(account, req);
  const res2 = await fetch(url, {
    headers: { "X-PAYMENT": xPayment, "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE" },
    signal: AbortSignal.timeout(60000),
  });
  return { res: res2, paid: res2.ok, req };
}

// ---------------- bookkeeping ----------------
function logCsv(row) {
  const header = "ts,task,decision_engine,decision,price_usd,paid,http,outcome";
  if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, header + "\n");
  fs.appendFileSync(LOG, row.map(v => String(v).replaceAll(",", ";")).join(",") + "\n");
}

const CACHE_FILE = path.join(import.meta.dirname, "cache.json");
function readCache() { try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { return {}; } }
function writeCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2)); }

// ---------------- main ----------------
async function runTask(task, account, cache, spent) {
  const url = `${BASE_URL}/${task.name}?${task.params}`;
  const cached = cache[task.name];
  const cachedAgeH = cached ? (Date.now() - cached.ts) / 3.6e6 : Infinity;
  const spendRef = { price: null, payTo: null, decision_note: "" };

  // First probe (unpaid) to discover the current price.
  let probe;
  try {
    probe = await fetchWithPayment(url, { account: null, dryRun: true, spendRef });
  } catch (e) { return { task, outcome: `network-error: ${e.message}` }; }

  const price = spendRef.price ?? 0;
  if (!probe.req && probe.res?.ok) {
    return { task, outcome: "free-200", data: await probe.res.json().catch(() => null) };
  }
  if (!probe.req) return { task, outcome: `http-${probe.res?.status}` };

  // ------- decision layer -------
  let decision = await jevDecide({
    taskName: task.name, reason: task.reason, priceUsd: price,
    cachedAgeHours: isFinite(cachedAgeH) ? +cachedAgeH.toFixed(1) : 999,
    budgetLeftUsd: +(BUDGET - spent).toFixed(4),
  });
  if (!decision) decision = heuristicDecide({
    priority: task.priority, cachedAgeHours: cachedAgeH, priceUsd: price, budgetLeftUsd: BUDGET - spent,
  });

  if (decision.action !== "pay") {
    logCsv([new Date().toISOString(), task.name, decision.engine, decision.action, price, "no", "-", decision.reason || ""]);
    return { task, outcome: `decision:${decision.action}`, decision };
  }
  if (price > BUDGET - spent) {
    logCsv([new Date().toISOString(), task.name, decision.engine, "skip-over-budget", price, "no", "-", ""]);
    return { task, outcome: "over-budget" };
  }

  // ------- payment attempt -------
  const hasFunds = Boolean(account) && !process.env.ODQ_DRY_RUN;
  const result = await fetchWithPayment(url, { account: hasFunds ? account : null, dryRun: !hasFunds, spendRef });

  if (hasFunds && result.paid && result.res.ok) {
    const data = await result.res.json().catch(() => ({}));
    cache[task.name] = { ts: Date.now(), data };
    writeCache(cache);
    spent += price;
    logCsv([new Date().toISOString(), task.name, decision.engine, "pay", price, "yes", 200, "settled"]);
    return { task, outcome: "paid-200", data };
  }
  if (!hasFunds) {
    logCsv([new Date().toISOString(), task.name, decision.engine, "would-pay", price, "no", "-", "dry-run: wallet not funded"]);
    return { task, outcome: "dry-run-would-pay", price, decision };
  }
  logCsv([new Date().toISOString(), task.name, decision.engine, "pay-failed", price, "no", result.res?.status, "payment rejected"]);
  return { task, outcome: `payment-failed-${result.res?.status}` };
}

async function runRound(account) {
  const cache = readCache();
  let spent = 0;
  const results = [];
  for (const task of TASKS) {
    const r = await runTask(task, account, cache, spent);
    results.push(r);
    console.log(`[${task.name}] ${r.outcome}` + (r.price != null ? ` (price $${r.price})` : "") + (r.decision ? ` engine=${r.decision.engine}` : ""));
  }
  return results;
}

async function main() {
  let account = null;
  if (process.env.ODQ_PRIVATE_KEY) {
    try {
      account = privateKeyToAccount(process.env.ODQ_PRIVATE_KEY.startsWith("0x") ? process.env.ODQ_PRIVATE_KEY : `0x${process.env.ODQ_PRIVATE_KEY}`);
      console.log(`wallet: ${account.address} (payment ENABLED)`);
    } catch { console.log("bad ODQ_PRIVATE_KEY -> dry-run mode"); }
  } else {
    console.log("no ODQ_PRIVATE_KEY -> dry-run mode (detects paywalls, pays nothing)");
  }
  console.log(`budget/run: $${BUDGET} | decisions: ${process.env.TYPESAFE_API_KEY ? "Jev (TypeSafe) with heuristic fallback" : "heuristic (set TYPESAFE_API_KEY to use Jev)"}`);

  do {
    console.log(`\n=== round ${new Date().toISOString()} ===`);
    await runRound(account);
    if (!RUN_ONCE) await new Promise(r => setTimeout(r, INTERVAL));
  } while (!RUN_ONCE);
}

main().catch(e => { console.error(e); process.exit(1); });
