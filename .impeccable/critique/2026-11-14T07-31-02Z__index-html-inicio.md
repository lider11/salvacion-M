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
---
Method: dual-agent (A: bc-fae135cc-72f4-55ef-9497-8e65d3626c27 · B: bc-3c9196d7-95ab-527f-8fa2-8fafdc75b58c)

#### Design Health Score

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

#### Design Specificity Verdict

**LLM:** Settled hero es Salvación M (navy, gold, CTA único). Diluido por prólogo cinematográfico ~4.5s y ciclo de color gold→mint→white.

**Deterministic scan:** detect exit 2, 12 hallazgos; pocos atribuibles al hero. Overlay: straggler en párrafo del hero (FP probable) + dark-glow en sombra de `.hero-visual img` (sombra intencional; detector la marca).

**Visual overlays:** Injection OK; overlays en viewport del hero (straggler + glow).

#### Overall Impression

El hero settled es calmado y alineado al producto; la puerta de entrada (intro + shatter) genera ansiedad y atrasa la promesa. Mayor oportunidad: default al hero usable, motion opcional/suave.

#### What's Working

- Copy settled alineado (barreras, pasos, consulta gratuita, sin garantía falsa).
- `prefers-reduced-motion` salta al hero final.
- Un CTA primario; tipografía de sistema; stack móvil usable.

#### Priority Issues

1. **[P0] Intro cinematográfica obliga a esperar** (~1.7s legible / ~4.5s settled). Suggested: `/impeccable distill`
2. **[P0] Sin skip** (solo reduced-motion). Suggested: `/impeccable harden`
3. **[P1] Color-loop mint/blanco** rompe One Accent. Suggested: `/impeccable quieter`
4. **[P1] Imagen final clínica + mazo** vs orientación sin garantía. Suggested: `/impeccable clarify`
5. **[P2] Box-shadow + espectáculo vs Flat-By-Default.** Suggested: `/impeccable polish`

#### Persona Red Flags

- Cuidador en crisis: 4s de shatter antes de saber que es orientación gratuita.
- Bata + mazo + familia feliz → expectativas clínicas/legales.
- Farmacia inicial puede mal-categorizar el sitio.

#### Minor Observations

- Marca vive en header; hero stripped es algo genérico advocacy.
- “Defender” inclina a litigio vs orientación serena.
- Contenido en DOM a opacity 0 (AT sí; visual no).

#### Questions to Consider

- Si la Sala es calma, ¿qué trabajo hace un shatter de 40 piezas?
- ¿Un cuidador que esperó 40 min en EPS espera 4s más por la metáfora?
