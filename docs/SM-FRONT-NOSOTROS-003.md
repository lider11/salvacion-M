# SM-FRONT-NOSOTROS-003

Fecha: 2026-11-08. SHA inicial: a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d.
Rama de trabajo: trabajo-nosotros-opcion-3. Cambios previos de Servicios preservados.

Inspección: README, AGENTS, memoria y sistema de diseño consultados. Rutas reales: index.html y css/style.css. #nosotros comparte actualmente reglas de fondo y longitud de párrafo con #contacto.

Riesgos antes de modificar: conflicto con reglas compartidas, desbordamiento móvil, alteración del texto institucional y duplicación de pasos de proceso. Mitigación: CSS acotado a #nosotros, columnas minmax, conservar literalmente h2 y párrafo; conceptos informativos sin controles ni promesas.

Archivos previstos: index.html, css/style.css y este informe con evidencias locales. Base de comparación: output/playwright/nosotros/antes.html y antes.css (estado de trabajo, incluye Servicios). Sin commit, push ni despliegue.

Método: planificar, construir, probar, criticar, corregir y verificar; máximo dos rondas adversariales y tres correcciones. Terminación: cambio local con pruebas disponibles, evidencias y sin defectos críticos/altos nuevos detectados.

## Resultado y pruebas ejecutadas

Implementado en index.html y css/style.css: fondo #102A43, h2 blanco, acento #F0C35B, párrafo original destacado y panel blanco con Orientación, Derechos en salud y Acompañamiento. SVG decorativos turquesa ocultos a lectores de pantalla. Sin nuevos controles, dependencias, JavaScript ni pasos de proceso. HTML fuera de #nosotros intacto; CSS nuevo limitado a #nosotros y retirada de su participación en el fondo compartido, conservando Contacto.

Herramientas locales: Playwright/Chromium, html-validate, css-tree y axe-core. Sin instalación de dependencias. Servidor temporal limitado a 127.0.0.1 y cerrado al finalizar.

| Prueba | Diagnóstico | Evidencia |
|---|---|---|
| Título y párrafo originales literales | PASS | originalHeadingAndParagraphVerbatim: true en resultados.json (incluye espacios y saltos internos) |
| HTML de Nosotros | PASS | Cero mensajes de html-validate dentro de la sección |
| HTML global | FAIL_REAL previo | figure dentro de span en cabecera, idéntico antes del cambio; fuera de alcance |
| CSS | PASS | css-tree: cero errores de parseo |
| Responsive | PASS | 320, 375 y 768: una columna; 1024 y 1440: dos columnas; cero overflow horizontal |
| Contraste | PASS | axe color-contrast aprobado sin pendientes; texto secundario blanco 7.54:1, iconos 5.61:1, título 14.64:1 |
| Teclado | PASS | Enter sobre enlace de navegación Nosotros llega a #nosotros visible; sección informativa sin elementos interactivos ni trampas |
| Enlaces de fragmento | PASS | Todos los destinos locales existen |
| Consola | PASS | Cero console.error y pageerror |
| Regresiones | PASS acotado | HTML externo idéntico y estilos calculados de todos los descendientes de cabecera, Hero, Servicios, Proceso, Contacto y footer idénticos en cinco tamaños: 30 comparaciones |
| axe WCAG A/AA en Nosotros | PASS automático | Cero violaciones y cero incompletos; incluye contraste, listas e iconos ocultos |
| Revisión visual | PASS | Capturas 375 y 1440 inspeccionadas |
| Auditoría integral WCAG y lector de pantalla | NOT_RUN | No se acredita conformidad integral |
| Diff | PASS | git diff --check sin errores; cambios.diff contra copia previa a esta tarea |

## Crítica adversarial

Ronda 1: inspección de HTML, CSS, contenido y resultados. El validador señaló aria-label en ul; retirado por innecesario. Una corrección.

Ronda 2: repetidas las pruebas tras corregir; ningún diagnóstico HTML nuevo, cero incidencias axe, contenido original intacto, capturas móvil/escritorio revisadas sin desbordamiento ni recortes. Sin defectos críticos o altos nuevos detectados en el alcance. El error de cabecera se conserva por restricción de alcance.

## Arbitraje: matriz booleana

| Requisito | Resultado | Evidencia |
|---|---|---|
| Texto original íntegro y clases existentes conservadas | TRUE | Comparación literal y diff |
| HTML semántico de #nosotros | TRUE | Validador sin mensajes en sección |
| CSS e identidad institucional | TRUE | Código, parseo y capturas |
| Responsive en los cinco tamaños | TRUE | resultados.json: widths |
| Contraste | TRUE | axe y contrast |
| Navegación por teclado | TRUE | resultados.json: keyboard |
| Iconos SVG decorativos accesibles | TRUE | aria-hidden en contenedor, focusable=false y axe |
| Ausencia de regresiones en lo comprobado | TRUE | outsideHtmlUnchanged y 30 comparaciones de estilos |
| Sin pasos de Proceso ni promesas de resultados | TRUE | Revisión de contenido y diff |
| Pruebas ejecutadas | TRUE | Script y resultados persistidos |
| Conformidad integral WCAG 2.2 AA | FALSE | NO_ACREDITADO; lector de pantalla y auditoría integral NOT_RUN |
| Producción sin modificar | TRUE | Solo edición local y servidor loopback; sin despliegue |

## Entrega

Archivos de producto modificados en esta tarea: index.html y css/style.css. Documentación: docs/SM-FRONT-NOSOTROS-003.md. Evidencias: output/playwright/nosotros/antes.html, antes.css, verificar.cjs, resumir.cjs, resultados.json, cambios.diff, nosotros-375.png y nosotros-1440.png.

Reproducir con módulos locales disponibles: node output/playwright/nosotros/verificar.cjs y node output/playwright/nosotros/resumir.cjs. La comparación usa las copias previas, no HEAD, para preservar Servicios sin commit.

Rama: trabajo-nosotros-opcion-3. SHA inicial y final de HEAD: a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d. Sin commit, push ni despliegue. Los cambios locales previos se conservan. Implementación local terminada; G3_PASS = FALSE.
