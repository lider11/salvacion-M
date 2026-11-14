---
target: "hero #inicio"
total_score: 14
max_score: 28
na_heuristics: 7,9,10
p0_count: 2
p1_count: 2
target_identity: "file:/workspace/index.html#inicio"
timestamp: 2026-11-14T07-31-02Z
slug: index-html-inicio
closed: true
remediated_at: 2026-11-14T07-35-00Z
commands_applied: distill, harden, quieter, clarify, polish
---
Method: dual-agent (A: bc-fae135cc-72f4-55ef-9497-8e65d3626c27 · B: bc-3c9196d7-95ab-527f-8fa2-8fafdc75b58c)

#### Design Health Score (pre-fix)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Copy/CTA invisibles ~1s; usable ~1.7s; settled ~4.5s sin estado/skip |
| 2 | Match System / Real World | 2 | Metáfora medicamento→shatter opaca; imagen final clínica/legal |
| 3 | User Control and Freedom | 1 | Intro forzada; solo escape = prefers-reduced-motion |
| 4 | Consistency and Standards | 2 | Sombra + ciclo mint vs Flat / One Accent Rule |
| 5 | Error Prevention | 3 | CTA honesto; riesgo residual en imaginería |
| 6 | Recognition Rather Than Recall | 3 | H1+cuerpo claros al settled; intro obliga a decodificar |
| 7 | Flexibility and Efficiency | n/a | Superficie Persuade |
| 8 | Aesthetic and Minimalist Design | 2 | Settled lean; shards + dual images + color-loop = espectáculo |
| 9 | Error Recovery | n/a | Sin estados de error en hero |
| 10 | Help and Documentation | n/a | Persuade; ayuda vive después |
| **Total** | | **14/28** | **Acceptable (~50%)** |

#### Remediation (usuario: 1b + 2b + 3c, todos seguidos)

- **distill:** hold ≤300ms; fade ~700ms; sin shatter/shards.
- **harden:** control «Saltar intro» (`data-hero-skip`); reduced-motion → settle inmediato.
- **quieter:** oro estático (`.hero-accent` / `--gold-bright`); sin color-loop.
- **clarify:** H1 «comprender» (no «defender»); imagen acompañamiento sin bata/mazo; alt reescrito.
- **polish:** sin box-shadow en `.hero-visual img`; media intro con fade de opacidad.

#### Priority Issues (histórico)

1. **[P0] Intro cinematográfica** → distill (hold 300ms + fade)
2. **[P0] Sin skip** → harden (botón Saltar intro)
3. **[P1] Color-loop** → quieter (oro estático)
4. **[P1] Imagen clínica/legal** → clarify (nueva imagen + copy)
5. **[P2] Box-shadow** → polish (plano)
