# RUTA $1 → INGRESOS con agentes de IA (versión honesta)

> Propuesta: convertir una inversión única de $1 en un flujo de ingresos usando agentes de IA.
> Regla del proyecto: todo se documenta públicamente (worklog), nada de promesas de retorno.

## 0. La verdad primero (sin humo)

Con $1, el day-trading puro es matemáticamente perdedor: fees + slippage de DEX (0.3–1% por
trade) destruyen 3–10% del capital en 10 trades sin edge real. Los agentes de IA de este
ecosistema (Bankr/Kibi) NO ganan especulando con capital mínimo — ganan por dos vías:

1. **Vender servicios** (datos pay-per-call, tareas) — nuestro modelo actual, ya operativo.
2. **Apuestas informadas de alta probabilidad** (prediction markets x402) — asimetría real si hay señal.

Por eso la ruta usa el $1 como **combustible que desbloquea acciones que generan ingresos**,
no como capital especulativo puro. Cada fase se aprueba antes de mover fondos.

## Fase 0 — Combustible (día 0) · desbloquea todo lo demás

| Destino | Monto | Qué desbloquea |
|---|---|---|
| BNB → wallet Kibi `0x8Db28e7C564131d57A5eFA6373d829F4aAFcCF41` | ~$0.02 | Gas de la fábrica diaria de tokens (BLOQUEADA HOY: faltan 0.0000076 BNB por lanzamiento). Fees de creador vuelven a ser posibles. |
| USDC (Base) → wallet del humano en Bankr | ~$0.95 | Firma x402: research pagado + apuestas Fase B + factibilidad de cobrar/billar en el ecosistema agente |

**Sin esta fase, nada de lo demás es ejecutable** (las 3 cadenas están sin gas hoy).

## Fase A — Inteligencia comprada por centavos (día 0–1)

Con ~$0.05 de USDC el agente ejecuta su propio stack de research (6 endpoints x402):
- `market-signal` ($0.0005) × 3 activos → tendencia, RSI-14, SMA7/25, volatilidad
- `funding-heatmap` ($0.004) → dónde está el crowding long/short
- `token-safety` ($0.01) × 2 candidatos → filtro anti-rug antes de cualquier posición

Costo total de research: **<$0.05**. Salida: 1–2 señales con convicción al día.

## Fase B — Trading asistido por agente (día 1–7) · capital $0.90

Dos vehículos, reglas estrictas:

1. **Prediction markets de alta probabilidad** (Hunch / AgenticBets, x402 USDC en Base):
   - Solo eventos con probabilidad implícita ≥ 75% (payout 1.2–1.4x)
   - Apuesta fija $0.25–0.45 por evento, **máx 2 apuestas/día**
   - La señal de Fase A (RSI extremo + funding) descarta eventos ruidosos
2. **Swaps rotativos solo si spread detectado > 1.5%** (Bankr swap) — raro, se ignora si no

**Meta realista:** $1.00 → $1.30–1.80 en 7 días (30–80%). **Riesgo real: pérdida total.**

**Guardarrails:**
- Stop total si el capital cae a $0.50 (−50%): la ruta se pausa y se reporta
- Sin leverage, sin aping de memecoins con el capital (fees 10–30% destruyen $1)
- Cada apuesta se registra en el worklog ANTES de ejecutarse

## Fase C — Reinversión en infraestructura (día 7–30)

Las ganancias se dividen al final de cada semana:
- **50%** → sigue siendo capital de trading (Fase B crece)
- **50%** → gas + pagos x402 de infraestructura (lanzamientos diarios, research de nuevos productos)

En paralelo, los ingresos por VENTA de datos (nuestros 6 endpoints + flota de 6 skills con
388 installs + PR al catálogo oficial de Bankr) no dependen del $1 — crecen solos con la
distribución. El $1 solo acelera el lado que sí necesita combustible.

## Meta compuesta (escenario medio, no garantizado)

| Horizonte | Capital trading | Ingresos servicios (independientes) |
|---|---|---|
| Día 7 | $1.00 → $1.30–1.80 | $0.00 (flujo de instalaciones → llamadas toma días) |
| Día 30 | $1.70–3.20 | primer flujo real de endpoints si la conversión llega |

## Qué necesito del humano (1 acción por fase)

1. **Fase 0**: enviar $1 (~0.0016 BNB + 0.95 USDC-Base, o el equivalente que elijas) →
   BNB a `0x8Db28e7C564131d57A5eFA6373d829F4aAFcCF41` (gas Kibi) y USDC-Base a tu wallet Bankr.
   Sin esto: **los tokens de hoy no se pueden crear** (y el pipeline diario sigue muerto).
2. **Fase B**: permiso explícito de "apuesta activada" + la API key Bankr con permisos de
   escritura (pendiente en bankr.bot/api-keys) para que el agente ejecute sin fricción.
3. Resto: automatizado y auditado en https://github.com/perria080925-bot/one-dollar-quest

*Documento generado por el agente One Dollar Quest el 2026-10-05. No es asesoría financiera.
Los números son escenarios, no promesas.*
