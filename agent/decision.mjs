/**
 * ODQ Consumer Agent - Decision module
 *
 * Decides whether to PAY for a data endpoint, use cache, or skip.
 * Layer 1 (optional): TypeSafe / Jev (System One) -> structured decision
 *   with calibrated probability + confidence.
 * Layer 2 (fallback): deterministic local heuristic with a daily budget cap.
 *
 * TypeSafe API: POST https://api.typesafe.ai/v1/systemone
 *   body: { state, model: "jev-latest", questions: { id: { type, instructions, criteria } } }
 * Docs: https://docs.typesafe.ai/api
 */

const TYPESAFE_API = "https://api.typesafe.ai/v1/systemone";
const MODEL = "jev-latest";

/**
 * Ask Jev whether paying is worth it. Returns null on any failure so the
 * caller can fall back to the heuristic. Never throws.
 */
export async function jevDecide({ taskName, reason, priceUsd, cachedAgeHours, budgetLeftUsd }) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) return null;

  const state = {
    agent: "ODQ consumer agent (autonomous, experimental)",
    task: taskName,
    reason_for_this_fetch: reason,
    price_usd: priceUsd,
    cached_copy_age_hours: cachedAgeHours,
    daily_budget_remaining_usd: budgetLeftUsd,
    policy:
      "Pay only when the data is fresh-needed and the cost is small relative to remaining budget. Never pay for something already fresh in cache.",
  };

  const body = {
    state,
    model: MODEL,
    questions: {
      action: {
        type: "choice",
        instructions: "What should the agent do to obtain this data right now?",
        criteria: {
          pay: "The data is needed now and the price is justified by the reason and remaining budget",
          cache: "The cached copy is still good enough for this reason",
          skip: "The data is not needed now; skip without paying",
        },
      },
      worth_paying: {
        type: "noul",
        instructions:
          "Is the price justified for the stated reason given the remaining daily budget?",
      },
      value_for_money: {
        type: "score",
        instructions: "Value for money of paying this price for this reason",
        criteria: [
          "Bad: price exceeds the usefulness of the data",
          "Marginal: usefulness barely justifies the price",
          "Good: usefulness clearly exceeds the price",
          "Excellent: trivial cost for essential data",
        ],
      },
    },
  };

  try {
    const res = await fetch(TYPESAFE_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const a = json.answers || {};
    return {
      engine: `typesafe/${json.model || MODEL}`,
      action: a.action?.choice || "skip",
      worth_paying: a.worth_paying?.noul,
      value_score: a.value_for_money?.score,
      confidence: a.action?.confidence ?? null,
    };
  } catch {
    return null; // graceful fallback
  }
}

/**
 * Deterministic fallback: pay if within daily budget, cache stale and task
 * priority allows it. Conservative by design.
 */
export function heuristicDecide({ priority, cachedAgeHours, priceUsd, budgetLeftUsd, minCacheHours = 6 }) {
  if (priceUsd > budgetLeftUsd) return { engine: "heuristic", action: "skip", reason: "over budget" };
  if (cachedAgeHours < minCacheHours) return { engine: "heuristic", action: "cache", reason: "cached copy fresh" };
  if (priority >= 3) return { engine: "heuristic", action: "pay", reason: "high priority within budget" };
  if (priceUsd <= 0.005) return { engine: "heuristic", action: "pay", reason: "cheap enough" };
  return { engine: "heuristic", action: "skip", reason: "low priority and not cheap" };
}
