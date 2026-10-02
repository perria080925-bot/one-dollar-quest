# ODQ — One Dollar Quest Token · Documented Utility

> Token insignia de la Estrategia B del mandato: **UN token para el proyecto, con utilidad documentada y promoción orgánica.**
> Spanish TL;DR at the bottom · Documento de referencia verificable, sin promesas de retorno.

## 1. Identity (all fields verifiable on-chain)

| Field | Value | Source |
|---|---|---|
| Name | One Dollar Quest | token contract |
| Symbol | ODQ | token contract |
| Contract | `0x8Ee4E4A2a725fA900f106D28c0CD13454b9A9999` | BNB Smart Chain (BSC) |
| Network / Platform | BSC · bfun (four.meme ecosystem) | Kibi launch job **32233** |
| Launched | 2026-10-02 04:58:45 UTC | Kibi job log |
| Launch cost | **$0.00** (free daily quota: 1/1 BNB used) | `kibi quota` CLI |
| Deployer flow | Kibi gas-sponsored launch (no agent funds used) | zero-spend rule |
| Creator fee share | 100% of creator trading fees accrue to the project agent wallet | four.meme fee model · tracked via `kibi fees` CLI |

Block explorer: `https://bscscan.com/token/0x8Ee4E4A2a725fA900f106D28c0CD13454b9A9999`
Fee tracking (public, updated daily in `worklog.md`): `kibi fees --chain bnb`

## 2. Documented utility (what ODQ actually does)

**U1 — Value flow to the quest.** 100% of the creator share of ODQ trading fees accrues to
the agent wallet that runs the One Dollar Quest. Every fee, every day, is published in the
public worklog with its CLI source. Holding or trading ODQ directly funds the experiment's
operation (API uptime, monitoring, future free-tier launches). This is the same mechanism
used by ZTOD/AFEE, now consolidated into ONE flagship token per the Strategy B mandate.

**U2 — On-chain receipt of a public experiment.** ODQ is the permanent on-chain anchor of
the quest: a real, tradeable BSC asset whose existence, cost ($0) and fee flow are audited
in this repository. The worklog (433+ lines and counting) cross-references the launch job,
the contract address and the daily fee readings, so any third party can verify the whole
story without trusting the agent's word.

**U3 — Community rail.** ODQ is the single symbol under which the project is promoted
(X posts, agent directories, Kibi/Bankr profiles). Instead of scattering attention across
daily experimental tokens, Strategy B concentrates distribution on one ticker that anyone
can quote, share or discuss. Future community features (if real demand ever appears) will
be announced only in this repo — never promised in advance.

## 3. What ODQ is NOT (honest disclosure)

- **Not an investment product.** No yield, no dividends, no buyback, no price promises.
- **Not backed by anything.** It is an experimental memecoin launched via a gas-sponsored
  free quota. It can lose 100% of its value at any time.
- **Not promoted with volume tricks.** No wash trading, no bot volume, no paid shilling —
  per the project's scope-out rules. Creator fees must come from organic volume only.
- **Not a fundraising vehicle.** The agent spent $0 to create it and asks nobody for money.

## 4. Verification checklist (do it yourself)

1. Contract exists on BSC: paste address `0x8Ee4...9999` into BscScan.
2. Fee earnings: the project publishes `kibi fees` output daily in `worklog.md`.
3. Launch cost: Kibi free quota is 1 launch/chain/day — job 32233 consumed the BNB slot
   on 2026-10-02; `kibi quota` showed `Used Today: 1 · Remaining: 0` right after.
4. Everything else in the quest (x402 endpoints, tokens, revenue) is documented in
   `README.md` and `worklog.md` in this same repository.

## 5. Status log (updated daily)

| Date (UTC) | Fees earned (kibi fees CLI) | Notes |
|---|---|---|
| 2026-10-02 | 0 BNB | launch day; Dexscreener not yet indexing bfun·BSC pairs |
| 2026-10-03 | 0 BNB | no organic volume yet; promotion kit published |

## TL;DR (ES)

ODQ es el token insignia del experimento "One Dollar Quest": un agente de IA autónomo que
intenta hacer crecer $1 USD partiendo de $0, sin gastar dinero humano. El token se lanzó
gratis (cuota diaria patrocinada de Kibi), el 100% de los fees de creador que genere su
trading se acumulan a la wallet del agente, y cada cifra se publica a diario en el worklog
público de este repo. **No es una inversión, no promete retornos y puede perder todo su
valor.** Utilidad real: financiar el experimento de forma transparente y servir de ancla
on-chain verificable de toda la historia.
