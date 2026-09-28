# Paying an x402 endpoint by hand (worked example)

This is the wire format used by Bankr x402 Cloud endpoints (x402 protocol v2, `exact`
scheme, USDC on Base). Use it when you cannot run the bundled Node script.

## Step 1 — probe the endpoint

```bash
curl -s -D headers.txt "https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal?coin=bitcoin&vs=usd"
# -> HTTP 402, body:
{
  "x402Version": 2,
  "error": "Payment Required",
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "maxAmountRequired": "1000",
    "amount": "1000",
    "resource": "https://x402.bankr.bot/0xf436...3010/market-signal",
    "payTo": "0x8AEE621035D93Deb3C0C1177fac252dC2dd501a0",
    "maxTimeoutSeconds": 60,
    "asset": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    "extra": { "name": "USD Coin", "version": "2" }
  }],
  "facilitator": "https://api.bankr.bot/facilitator"
}
```

`amount`/`maxAmountRequired` are in **atomic units** — USDC has 6 decimals, so `1000`
means $0.001.

## Step 2 — build the EIP-3009 authorization

Sign a `TransferWithAuthorization` typed-data (EIP-712) for the USDC contract:

- Domain: `{ name: "USD Coin", version: "2", chainId: 8453, verifyingContract: 0x8335...2913 }`
- Message fields: `from` (your wallet), `to` (=`payTo`), `value` (=`amount`),
  `validAfter` (now − 600), `validBefore` (now + timeout + 300), `nonce` (random 32 bytes).

USDC on Base is an EIP-3009 token (`extra.name`/`extra.version` tell you the domain).
This is a signature only — nothing is broadcast by you. The **facilitator** verifies the
signature, executes the `transferWithAuthorization` on-chain, and settles the payment.

## Step 3 — assemble and send the X-PAYMENT header

```json
{
  "x402Version": 2,
  "accepted": { "scheme": "exact", "network": "eip155:8453", "amount": "1000",
    "resource": "<resource from 402>", "payTo": "<payTo>", "maxTimeoutSeconds": 60,
    "asset": "0x8335...2913", "extra": { "name": "USD Coin", "version": "2" } },
  "payload": {
    "signature": "<0x65-byte hex r||s||v signature from step 2>",
    "authorization": { "from": "0x<you>", "to": "0x8AEE...501a0", "value": "1000",
      "validAfter": "1760000000", "validBefore": "1760000960", "nonce": "0x<64 hex>" }
  }
}
```

Base64url-encode that JSON and retry the original request:

```bash
curl -s -H "X-PAYMENT: eyJ4NDAyVmVyc2lvbiI6MiwiYWNjZXB0ZWQiOnt9..." \
  "https://x402.bankr.bot/0xf436...3010/market-signal?coin=bitcoin&vs=usd"
# -> HTTP 200 with the data
```

## Verification checklist (agent discipline)

- [ ] Live `amount` re-read from the actual 402 (prices can change)
- [ ] Amount converted to USD and checked against budget
- [ ] `payTo` matches the expected vendor (from `accepts[0].payTo`)
- [ ] Signature produced for the correct `chainId` (8453 = Base)
- [ ] On non-200 after payment: do NOT blind-retry; the facilitator only settles on
      success, but you should still read the error first

## Alternative: SDK shortcut

In JavaScript you can skip step 2-3 assembly with the official client helper
(`x402-fetch` style `wrapFetchWithPayment(signer)`); the header it produces is exactly
the one above. The bundled `scripts/agent.mjs` implements the flow explicitly with
`viem` so it works in any Node ≥ 18 environment with zero extra runtime services.
