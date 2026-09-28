// Unit test: builds and signs a real x402 v2 payment header shape (no network).
import { privateKeyToAccount } from "viem/accounts";

const req = {
  version: 2, scheme: "exact", network: "eip155:8453", chainId: 8453,
  amount: "1000", payTo: "0x8AEE621035D93Deb3C0C1177fac252dC2dd501a0",
  asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  extra: { name: "USD Coin", version: "2" },
  maxTimeoutSeconds: 60,
  resource: "https://x402.bankr.bot/0xf436ca41bd0a236338bef57adeb4976677513010/market-signal",
};
const account = privateKeyToAccount("0x0000000000000000000000000000000000000000000000000000000000000001");
const now = Math.floor(Date.now() / 1000);
const authorization = {
  from: account.address, to: req.payTo, value: req.amount,
  validAfter: String(now - 600), validBefore: String(now + 900),
  nonce: "0x" + "11".repeat(32),
};
const sig = await account.signTypedData({
  domain: { name: "USD Coin", version: "2", chainId: 8453, verifyingContract: req.asset },
  types: { TransferWithAuthorization: [
    { name: "from", type: "address" }, { name: "to", type: "address" },
    { name: "value", type: "uint256" }, { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" }, { name: "nonce", type: "bytes32" },
  ]},
  primaryType: "TransferWithAuthorization", message: authorization,
});
const header = Buffer.from(JSON.stringify({
  x402Version: 2,
  accepted: { scheme: req.scheme, network: req.network, amount: req.amount, resource: req.resource, payTo: req.payTo, maxTimeoutSeconds: req.maxTimeoutSeconds, asset: req.asset, extra: req.extra },
  payload: { signature: sig, authorization },
})).toString("base64url");
console.log("signature OK, length:", sig.length);
console.log("X-PAYMENT header (first 120 chars):", header.slice(0, 120));
console.log("decodes back OK:", !!JSON.parse(Buffer.from(header, "base64url").toString()).payload.authorization.from);
