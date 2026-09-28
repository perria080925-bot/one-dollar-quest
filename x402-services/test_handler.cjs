// Local validation of the market-signal handler logic (same code, mocked Request)
const { pathToFileURL } = require('url');

class FakeURL {
  constructor(u) { this.u = new URL(u); }
  get searchParams() { return this.u.searchParams; }
}

(async () => {
  const mod = await import(pathToFileURL('/home/z/my-project/x402svc/x402/market-signal/index.ts').href);
  const req = new Request('https://x402.bankr.bot/0x35c5/market-signal?coin=bitcoin&vs=usd');
  const out = await mod.default(req);
  console.log(JSON.stringify(out, null, 2));
})();
