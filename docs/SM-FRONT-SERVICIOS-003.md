# SM-FRONT-SERVICIOS-003 — inspección y riesgos

Fecha: 2026-11-08. SHA inicial: a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d.
Rama inicial: main. Rama de trabajo: trabajo-servicios-opcion-3.

Leídos README, AGENTS, memoria, arquitectura, ADN y sistema de diseño.
HTML activo: index.html. CSS activo: css/style.css; css/styles.css no enlazado.
Cambios previstos: sección #servicios, reglas CSS acotadas y esta evidencia.
Archivos locales previos preservados: privacidad.html, assets/hero-acompanamiento.svg y work/.

Riesgos previos a implementación:
- Reglas globales .servicios-grid en breakpoints: retirar solo estas reglas obsoletas y usar selectores #servicios.
- Flechas sin destino: tarjetas enlazarán al contacto informativo existente, con nombre accesible contextual.
- CTA dorado difiere de la especificación general: la orden específica autoriza #F0C35B.
- Formulario no disponible: preservar aviso y no simular recepción.
- Sin auditoría integral ni backend: G3 permanece FALSE.

Método: construir, probar, crítica adversarial y arbitraje con evidencia; máximo dos rondas y tres correcciones.
Terminación: cambio local, pruebas disponibles ejecutadas y sin defectos críticos/altos detectados.

## Implementación y evidencia final

Construcción: conservados #servicios, .container, .servicios-grid y .servicio. Tres tarjetas enlazan a #contacto con nombres accesibles, SVG decorativos y flechas. CTA dorado; sin nuevo JavaScript, dependencias, formularios o endpoints. CSS delimitado por #servicios. Capturas revisadas visualmente a 375 y 1440 px.

Herramientas: Node y módulos locales Playwright, html-validate, css-tree y axe-core. Se intentó primero Playwright CLI; tras la demora se utilizó la biblioteca local, sin añadir frameworks ni paquetes al proyecto. La verificación se ejecutó contra un servidor HTTP efímero enlazado exclusivamente a 127.0.0.1, cerrado al terminar.

Reproducción (con los módulos locales disponibles): `node output/playwright/verificar.cjs`. El script compara contra HEAD; para conservar esta referencia después de un futuro commit, sustituir HEAD por el SHA inicial indicado arriba.

| Verificación | Diagnóstico | Evidencia |
|---|---|---|
| Estructura HTML de servicios | PASS | html-validate: ningún diagnóstico dentro de #servicios |
| Documento HTML completo | FAIL_REAL | Error preexistente de figure dentro de span en cabecera, igual en HEAD; no se modifica por alcance |
| Sintaxis CSS | PASS | css-tree: cero errores de parseo |
| Responsive | PASS | 320, 375, 768, 1024 y 1440 px sin overflow; tarjetas apiladas |
| Contraste calculado | PASS | Texto normal mínimo 7.54:1; iconos 5.61:1; CTA 8.83:1; foco interior 6.18:1 |
| Teclado | PASS | Tab recorre tres tarjetas y CTA, contorno sólido de 3 px; Enter llega a #contacto visible |
| Enlaces | PASS | Cuatro activaciones llegan a #contacto y todos los fragmentos de la página existen |
| Consola | PASS | Cero pageerror y console.error durante los recorridos |
| Movimiento reducido | PASS | Transición del CTA 0s con preferencia reduce |
| axe en servicios | NO_ACREDITADO integral | Cero violaciones confirmadas; un resultado incompleto de color-contrast. No equivale a aprobación integral WCAG |
| Regresiones fuera de servicios | PASS acotado | HTML idéntico normalizando CRLF; estilos calculados de todos los descendientes idénticos en seis secciones, cinco tamaños (30 comparaciones) |
| Sintaxis JavaScript | PASS | node --check js/main.js; archivo sin modificar |
| Integridad del parche | PASS | git diff --check |
| Lector de pantalla y auditoría integral WCAG | NOT_RUN | No se acredita conformidad completa |

Evidencia: `output/playwright/resultados.json`, `output/playwright/servicios-375.png`, `output/playwright/servicios-1440.png` y script `output/playwright/verificar.cjs`.

## Crítica adversarial y corrección

Ronda 1: revisión de diff detectó pérdida de tildes, signos y flechas por codificación de stdin en Windows. Corregido mediante escritura UTF-8; comprobadas capturas finales y nombres accesibles. Una corrección de producto.

La comparación inicial de capturas por bytes dio diferencias fuera de servicios por rasterización y posición de scroll. Se sustituyó esa comprobación por comparación completa de estilos calculados y HTML fuera de servicios. No se presentan las capturas iniciales como evidencia de ausencia de regresión píxel a píxel.

Ronda 2: revisión de capturas móvil/escritorio, selectores, destinos, teclado, responsive y resultados. No se detectan defectos críticos o altos nuevos en el alcance. Se conservan explícitas las limitaciones de validación global y accesibilidad integral. El resultado incompleto de axe no es una violación confirmada; los pares de colores implementados se calcularon por separado.

## Arbitraje — matriz booleana

Criterios acotados al rediseño de servicios, salvo accesibilidad integral, que se evalúa de forma conservadora.

| Requisito | Resultado | Diagnóstico |
|---|---|---|
| HTML semántico de la sección | TRUE | PASS; documento global con error preexistente |
| CSS institucional | TRUE | PASS |
| Responsive | TRUE | PASS |
| Accesibilidad integral WCAG 2.2 AA | FALSE | NO_ACREDITADO |
| Navegación funcional | TRUE | PASS |
| Ausencia de regresiones en el alcance comprobado | TRUE | PASS |
| Pruebas ejecutadas | TRUE | PASS |
| Producción sin modificar | TRUE | PASS; solo archivos locales y servidor loopback |

Archivos modificados: index.html, css/style.css, docs/08-memoria-del-sistema.md. Añadidos: este informe y cuatro archivos de evidencia bajo output/playwright/. Los elementos sin seguimiento previos permanecen intactos.

Sin commit, push ni despliegue. SHA final de HEAD igual al inicial: a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d; los cambios locales no tienen SHA de commit propio.

Implementación local terminada con pruebas disponibles y revisión adversarial. G3_PASS = FALSE: esta entrega no acredita los siete criterios del sistema.
