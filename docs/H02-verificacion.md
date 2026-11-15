# H02 — Unificación del formulario

Fecha: 15 de noviembre de 2026. Base remota: `3d6e7833040583851d23531050599fa932573675`.
Rama: `fix/h02-formulario-controlador-unico`. Estado: **RESUELTO FUNCIONALMENTE; revisión manual con lector de pantalla pendiente**.

## Diagnóstico y corrección

`js/main.js` tenía dos controladores para `orientacion-form`. Al cambiar o quitar `data-preview-only`, ambos registraban eventos y podían sustituir el mensaje de revisión por textos de aceptación o disponibilidad futura. Sus validaciones diferían. Las tres tarjetas visibles no tenían `data-servicio`; faltaban enlaces para otras tres categorías ya disponibles en el formulario.

- Se conserva un controlador, una función de validación y un manejador por evento del formulario. Texto usa `input`; radios y casilla usan `change`, sin validar dos veces la misma acción ni repetir el mismo anuncio de estado.
- Reglas alineadas con el contrato PHP: nombre 3–100, correo hasta 254, teléfono opcional de 7–15 dígitos y hasta 25 caracteres, ciudad opcional de 2–100, lista cerrada de seis servicios y descripción 20–1000 sin controles. Conteo Unicode por puntos de código. El formato de correo usa también la validez nativa de `type=email`; no se promete equivalencia exhaustiva con `FILTER_VALIDATE_EMAIL`. PHP sigue siendo la autoridad para una integración futura.
- Errores asociados mediante `aria-describedby`, `aria-invalid`, resumen con enlaces y foco, y `role=status`. La lectura del borrador no se convierte en consentimiento para la API.
- Se completan los seis enlaces manteniendo los componentes y CSS existentes, con selección de categoría, un desplazamiento y un foco por activación normal. Se respeta movimiento reducido y clics modificados.
- Bloqueo incondicional de `submit`, `method=dialog`, sin `action`, envío oculto/deshabilitado y sin transporte ni persistencia desde el controlador. El atributo de vista previa no es una autorización ni un interruptor de envío. No se conecta la API.
- `privacidad.html` y `docs/backend-hostinger.md` distinguen la casilla actual de la autorización futura. No se aprueba el borrador jurídico.

## Evidencia y límites

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Sintaxis JavaScript y pruebas | PASS | `node --check js/main.js`, `node --check tests/h02-formulario.cjs`, `node --check tests/h02-formulario-dom.cjs` |
| Diff y atributos HTML duplicados | PASS | `git diff --check` y análisis con HTMLParser de `index.html` y `privacidad.html` |
| DOM simulado: validación, mensajes, enlaces, foco DOM y cancelación de submit | 41/41 PASS | `output/h02/dom-results.json`, con SHA-256 del código probado |
| Misma batería contra la base | 21 PASS / 20 FAIL | `output/h02/baseline-dom-results.json`; evidencia de defectos detectados, no resultados de la corrección |
| Chromium / Playwright | 48/48 PASS | `output/h02/results.json`; Chromium 151.0.7922.34 |
| POST/API/almacenamiento, submit nativo, Enter y atributo de vista previa alterado | PASS: cero POST, solicitudes a `/api/`, navegación de envío o persistencia | `tests/h02-formulario.cjs`; servidor E2E rechaza cualquier método distinto de GET |
| Responsive y menú móvil | PASS en 320/375/768/1024/1440 px; menú validado con teclado/Escape y cambio a escritorio | Capturas en `output/h02/` y `results.json` |
| axe WCAG A/AA automatizado | Cero violaciones confirmadas en los cinco anchos; `color-contrast` queda incompleto para revisión manual | `results.json`; elementos decorativos con flecha y textarea con fondo parcialmente oscurecido; no equivale a aprobación automática de contraste |
| Foco visual y navegación de seis servicios | PASS en Chromium: selección, un cambio, un foco y un scroll por activación | `tests/h02-formulario.cjs` |
| Lectores de pantalla reales | NO VERIFICADO | Sin sesión de tecnología de asistencia |
| API PHP, MySQL y Hostinger | Fuera del alcance; no ejecutados | Sin modificaciones ni despliegues |

Las pruebas jsdom ejecutan el código real sobre un DOM simulado. La batería E2E también se ejecutó en Chromium local: observa peticiones del navegador y del servidor, prueba `requestSubmit()`, submit nativo, Enter y controles alterados. Resultado: cero POST/API, cero navegación de envío y cero excepciones de consola. Las capturas móvil/escritorio se inspeccionaron. Axe no confirmó violaciones, pero dejó contraste incompleto; no se declara conformidad WCAG integral.

El bloqueo de interfaz cubre los controles previstos y cambios accidentales del atributo de vista previa; no pretende impedir que código arbitrario o una persona con consola sustituya el formulario, su método y sus manejadores. La API y su futura habilitación requieren controles independientes.

## Reproducción

Desde una copia de la rama, con Node y dependencias de prueba disponibles (sin modificar la aplicación):

```sh
npm install --no-save --package-lock=false jsdom@26.1.0 playwright@1.62.1 axe-core@4.11.0
node --check js/main.js
node tests/h02-formulario-dom.cjs
npx playwright install chromium
node tests/h02-formulario.cjs
```

Puede indicarse `CHROMIUM_PATH` para un ejecutable instalado. `H02_ROOT` selecciona la copia que se probará y `H02_OUTPUT` el directorio de resultados. El servidor E2E se limita a `127.0.0.1`, rechaza recepción API y usa únicamente datos ficticios. Las peticiones se observan tanto en Playwright como en el servidor; una petición bloqueada por el servidor también debe fallar la prueba.

## Cierre

La batería Chromium se ejecutó después del primer bloqueo ambiental y pasó 48/48 comprobaciones. Se corrigieron dos detalles de la propia prueba: espera del evento asíncrono al cambiar el viewport y selector no ambiguo en privacidad; se añadió una aserción de seis manejadores para los seis enlaces. **H02 queda RESUELTO en su alcance funcional**, sin habilitar envío ni desplegar. La validación manual con lector de pantalla y el contraste marcado incompleto por axe permanecen NO VERIFICADOS; no se presenta esto como certificación WCAG. Se propone el cambio mediante PR en borrador; no hacer merge automáticamente.
