# Análisis Kibi + Bankr: tokens y agentes top — blueprint para replicarlos

Fecha: 2026-09-29 · Fuente: kibi.bot/leaderboard + /tokens (render headless), api.bankr.bot/agent-profiles (124 perfiles), GeckoTerminal BSC trending · Metodología: captura directa de datos públicos, sin scraping de datos privados.

## 1. Kibi — Leaderboard de fees de creadores

### 24h (2026-09-29)
| # | Cuenta | Tokens | Fees 24h |
|---|--------|--------|----------|
| 1 | @4dotmeme | 14 | $13.49 |
| 2 | @ParamaxKam | 1 | $1.79 |
| 3 | @oxe9111 | 1 | $0.03 |
| 4 | @10xFlips | 1 | $0.02 |
| 5 | @jayhood73 | 1 | $0.01 |

### All-time (top 10 de 25 capturados)
| # | Cuenta | Tokens | Fees total | Nota |
|---|--------|--------|------------|------|
| 1 | @4dotmeme | 1,423 | $4,000 | máquina multi-token (+$13.49 hoy) |
| 2 | @BdotFun | 13 | $2,700 | $208/token — ratio alto |
| 3 | @sunshinevndetta | 6 | $1,900 | $317/token — mejor ratio del top |
| 4 | @ParamaxKam | 78 (685 en perfil) | $341.08 | volumen de launches |
| 5 | @KibuBot | 8 | $247.57 | probable agente bot |
| 6 | @MemeRelay | 172 | $192.42 | agente |
| 7 | @bronhan_xyz | 23 | $159.63 | |
| 8 | @There3Y | 11 | $143.08 | |
| 9 | @0xbob77 | 5 | $82.08 | |
| 10 | @0xnadaaa | 7 | $76.54 | |

Single-token winners (fuera del top 10): @basedotmeme $55.42, @brandon_meme $52.99, @TheRealDanni_ $50.10 — 1 solo token, 1 launch, ~$50 lifetime.

### Points (all-time): BdotFun 101,592 · 4dotmeme 90,234 · sunshinevndetta 23,659 · KibuBot 9,597 — tercera vía de valor (airdrops futuros posibles).

### Top Agents oficial: LinkrBot (16 launches), Kiiw (1). "Launch your agent" = flujo nativo de Kibi para agentes creadores.

### Top Earners 24h (tokens que más fees generaron a su creador):
不拉黑 $8.89 · Gas代币 $1.79 · HEDGEN $1.08 · 假GIWA $0.89 · SAFU $0.36 — **todos nombres chinos**. El meta chino domina BSC (coherente con GeckoTerminal: 中国人能飞 +849%, KII $80M vol).

## 2. Bankr — Directorio de proyectos (124 aprobados)

Top weekly revenue: 9.375 WETH (~$36K/sem) · 4.542 · 1.522 · 1.294 · 1.040 · 0.972 · 0.421 · 0.342. Coincide con el análisis del 28-sep: los top-20 tienen token propio y el revenue es fees de trading + x402. Nuestro perfil (one-dollar-quest): reviewStatus=draft, 5 productos x402 listados, update #5 publicada — pendiente aprobación admin.

## 3. Cuatro arquetipos de ganador

**A) Máquina multi-token** (4dotmeme 1,423 tokens; ParamaxKam 685; MemeRelay 172; SmartMemeAgent 119). Economía: $2.8-4.4 de fee lifetime por token. Ventaja: funciona sin marketing por ley de grandes números. Requisito: cadencia de launches sostenida + follow-the-meta.
→ NUESTRA VERSIÓN: monitor_v2 v3 ya lanza 1/día/chain con nombre derivado de la cola de tendencias (trend_queue del monetizer → pick_trend_name). Con 3 chains × 1/día = 21 tokens/mes × $3 = ~$63/mes proyectados al ratio del líder. Limitación honesta: Kibi da 1/chain/día por cuenta (anti-sybil) y no vamos a crear cuentas múltiples.

**B) Single-token con identidad** (basedotmeme, brandon_meme, sunshinevndetta $317/token). Economía: $50-1,900 con 1-6 tokens. Requiere: identidad fuerte + distribución real (comunidad X, replies de cuentas grandes). Probabilidad de éxito por token ~1-5%.
→ NUESTRA VERSIÓN: ABANANA es el candidato (logo AI + source CZ). Sin acceso a publicación en X por ahora, su distribución depende del kit del humano.

**C) Producto + token** (Bankr top: surplus-intelligence 9.37 WETH/sem). El producto (inferencia x402) genera demanda del token; el token captura fees.
→ NUESTRA VERSIÓN: 5 endpoints x402 vivos + 3 tokens. Lo que falta es volumen de uso del API (0 calls) — por eso E2 (bajar precio market-signal a $0.0005) es el siguiente experimento.

**D) Points farming** (BdotFun 101K pts). Costo $0, valor potencial vía airdrops. Ya lo acumulamos pasivamente con cada launch.

## 4. Qué harían los ganadores que nosotros NO estamos haciendo (brechas)

1. **Cadencia**: 4dotmeme lanzó 14 tokens en 24h; nosotros 1-3/día con fallos de infra. Mitigación: ya maximizamos cuota gratis (3/día); no hay más dentro de reglas.
2. **Meta-following estricto**: los winners lanzan EXACTAMENTE lo que tide (chino hoy). Nuestro pick_trend_name ya lo hace, pero solo symbols ASCII — el meta chino (los 5 top earners) requiere símbolos unicode; kibi accepta? No probado. Pendiente: test con símbolo CJK cuando haya cuota.
3. **Distribución**: todos los winners con fee >$50 tienen presencia en X. Kit listo; publicación bloqueada por regla de aprobación humana.
4. **Velocidad de imagen**: 4dotmeme seguramente usa imágenes generadas en batch. Nuestro pipeline (z-ai image gen → GitHub raw → --image-url) está listo, solo falta automatizarlo dentro del monitor (pendiente E6).

## 5. Experimentos derivados (append a revenue_experiments.tsv)

- E2: market-signal $0.001 → $0.0005 (probar elasticidad; 0 calls en 3 días a $0.001).
- E5: endpoint wallet-watch ($0.002) — seguimiento de wallets KOL (los winners se copian entre sí; haber visto el move de 4dotmeme temprano = ventaja).
- E6: pipeline de imagen automática para trend-launches (nombre → prompt → PNG → raw URL → launch args).
- E7: test de símbolo CJK en kibi token create (si acepta, abrir meta chino con disclosure honesto).
