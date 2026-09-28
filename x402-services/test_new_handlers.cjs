// Validate pair-scan and token-safety handlers locally with live data
const { pathToFileURL } = require('url');

async function run(svc, qs) {
  const mod = await import(pathToFileURL(`/home/z/my-project/x402svc/x402/${svc}/index.ts`).href);
  const req = new Request(`https://x402.bankr.bot/0x35c5/${svc}?${qs}`);
  const out = await mod.default(req);
  console.log(`=== ${svc} ===`);
  console.log(JSON.stringify(out, null, 2).slice(0, 1200));
  console.log('...\n');
}

(async () => {
  await run('pair-scan', 'token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base');
  await run('token-safety', 'token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
})();
