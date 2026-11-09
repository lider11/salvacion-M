# SM-FRONT-PROCESO-001

Inspección 2026-11-08: README, AGENTS, memoria y sistema de diseño revisados. HTML activo index.html y CSS enlazado css/style.css. Reglas existentes de #proceso ol/li y breakpoint 600 px identificadas; .container global se conserva.
Rama inicial trabajo-nosotros-opcion-3; rama de implementación trabajo-proceso-001. SHA inicial a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d.
Los cambios de Servicios/Nosotros permanecen sin commit; base real de comparación guardada en output/playwright/proceso/antes.html y antes.css.

Riesgos antes de modificar: conectores desalineados, marcadores de lista duplicados, desbordamiento con zoom y fugas de estilos. Mitigación: pseudoelementos por etapa, números decorativos con lista ordenada nativa, CSS acotado y reflujo vertical. Sin controles falsos, promesas ni cambios de formulario.

Plan: construir HTML/CSS exclusivo de Proceso, probar cinco tamaños, contraste, teclado, zoom y regresiones; crítica adversarial y arbitraje. Máximo dos rondas y tres correcciones. Terminación local con evidencia, sin críticos/altos nuevos detectados. Archivos de producto previstos: index.html y css/style.css. Sin publicación.

## Implementación

Modificados exclusivamente el bloque HTML #proceso y sus reglas CSS en index.html y css/style.css. Se conservan id, .container, h2, ol, tres títulos originales y secuencia. Números 01–03 decorativos, SVG ocultos a tecnologías de asistencia, descripciones solicitadas y CTA real a #contacto. Sin JavaScript, bibliotecas ni dependencias nuevas. A partir de 1024 px: tres columnas; hasta 1023 px: vertical por legibilidad. Pseudoelementos conectan los centros de los círculos.

## Pruebas y evidencias

Ejecución local con módulos ya disponibles: Playwright/Chromium, html-validate, css-tree y axe-core. Servidor HTTP efímero 127.0.0.1 cerrado al terminar.

| Comprobación | Diagnóstico | Evidencia |
|---|---|---|
| HTML de Proceso | PASS | Ningún diagnóstico nuevo; lista con tres listitem en árbol accesible |
| Texto y secuencia originales | PASS | originalStepsPreserved=true |
| Documento HTML completo | FAIL_REAL previo | Figure dentro de span en cabecera; mismo error antes y después, fuera del alcance |
| Sintaxis CSS | PASS | Cero errores de parseo css-tree |
| Responsive 320/375/768/1024/1440 | PASS | Cero overflow; una columna en 320/375/768, tres en 1024/1440 |
| Conectores | PASS | Medidas de pseudoelementos en widths; capturas móvil/escritorio inspeccionadas |
| Contraste calculado | PASS | Texto secundario 7.54:1; navy/blanco 14.64:1; blanco/turquesa e iconos 6.18:1 |
| axe | NO_ACREDITADO integral | Cero violaciones confirmadas; un incompleto de color-contrast; cálculos por separado no sustituyen auditoría integral |
| Teclado y CTA | PASS | Foco sólido 3 px y Enter lleva a #contacto visible |
| Enlaces | PASS | Todos los fragmentos de página existen |
| Zoom CSS 200 % | PASS en sección | Ningún descendiente de Proceso sale de sus límites a 1440 o 375 px |
| Zoom CSS 200 % global a 375 | FAIL_REAL fuera de sección | Hay overflow de documento; Proceso no sale de sus límites. No se modifica otra sección y no se afirma haber acreditado zoom global |
| Reflujo equivalente 200 % escritorio | PASS | Anchos efectivos 720 y 512, sin overflow y disposición vertical; no equivale a ensayo manual de zoom del navegador |
| Movimiento reducido | PASS | Transición 0s y animation none en CTA |
| Consola | PASS | Cero errores de página y console.error |
| Regresiones | PASS acotado | HTML externo idéntico normalizando CRLF; estilos calculados de todos los descendientes de cabecera, Hero, Servicios, Nosotros, Contacto y footer idénticos en cinco tamaños (30 comparaciones) |
| Diff | PASS | git diff --check sin errores |
| Lector de pantalla / WCAG integral | NOT_RUN | NO_ACREDITADO |

## Crítica adversarial y correcciones

Ronda 1: las capturas mostraron conector horizontal por encima de los centros debido a la caja del marcador de lista. Corregido con distribución flex de las etapas, conservando ol y los tres listitem en el árbol accesible. Se permitió envolver el CTA para anchos reducidos. Primer ciclo de corrección.

Ronda 2: la alineación heredada de flex centraba los círculos en las filas móviles, separándolos del extremo del conector. Corregido con align-items:start en la cuadrícula móvil. Segundo ciclo de corrección. Pruebas repetidas y capturas finales inspeccionadas: conectores centrados y sin defectos críticos/altos nuevos confirmados en el alcance. Las limitaciones globales y el resultado incompleto de axe permanecen explícitos.

## Matriz final del árbitro

| Criterio | Resultado | Evidencia |
|---|---|---|
| HTML semántico conservado | TRUE | Validador, originalStepsPreserved y listAccessibility |
| Línea de tiempo horizontal | TRUE | Capturas y widths a 1024/1440 |
| Adaptación vertical móvil | TRUE | Captura 375 y widths 320/375/768 |
| Paleta institucional | TRUE | CSS y capturas |
| Iconografía accesible | TRUE | SVG aria-hidden y focusable=false; axe |
| Enlace a contacto funcional | TRUE | keyboard y contact |
| WCAG 2.2 AA acreditado | FALSE | NO_ACREDITADO; axe incompleto y auditoría integral pendiente |
| Ausencia de regresiones en el alcance verificado | TRUE | outsideHtmlUnchanged y 30 comparaciones de estilos |
| Producción sin modificar | TRUE | Solo archivos locales y servidor loopback; sin publicación |

## Entrega y estado

HTML: index.html. CSS: css/style.css, bloque SM-FRONT-PROCESO-001 y retirada de las reglas obsoletas de Proceso. Diff exclusivo contra estado previo: output/playwright/proceso/cambios.diff. Resultados: resultados.json. Capturas: proceso-375.png y proceso-1440.png. Baselines: antes.html y antes.css, con hashes guardados en resultados. Reproducción: node output/playwright/proceso/verificar.cjs; node output/playwright/proceso/resumir.cjs.

Rama final trabajo-proceso-001. SHA inicial y final de HEAD a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d; sin commit propio para estos cambios. Estado: index.html y css/style.css modificados, cambios locales previos preservados, informe y evidencias añadidos sin seguimiento. Sin commit, push ni despliegue. No se alteraron CRM, persistencia, autenticación, scheduler ni integraciones.

Implementación frontend local terminada con pruebas disponibles ejecutadas. Pendientes: auditoría WCAG integral, revisión de lector de pantalla, ensayo manual de zoom de navegador y defectos globales fuera de alcance. G3_PASS = FALSE.
