# H02 — Unificación del formulario

Fecha: 15 de noviembre de 2026. Base remota: `3d6e7833040583851d23531050599fa932573675`.
Rama: `fix/h02-formulario-controlador-unico`. Estado: **PARCIAL: implementado; navegador pendiente**.

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
| Chromium / Playwright | BLOCKED, 0 comprobaciones E2E ejecutadas | `output/h02/browser-blocked.json` |
| POST reales, envío nativo, Enter y controles alterados en navegador | NO VERIFICADO | Batería preparada en `tests/h02-formulario.cjs`; no ejecutada por bloqueo de inicio |
| Responsive, navegación móvil, foco visual y axe | NO VERIFICADO | Chromium aborta con `socket() failed: Operation not permitted (1)`; descarga alternativa de Headless Shell inválida |
| Lectores de pantalla reales | NO VERIFICADO | Sin sesión de tecnología de asistencia |
| API PHP, MySQL y Hostinger | Fuera del alcance; no ejecutados | Sin modificaciones ni despliegues |

Las pruebas jsdom ejecutan el código real sobre un DOM simulado. Instrumentan los puntos de transporte/almacenamiento y comprueban la cancelación del evento, pero **no demuestran ausencia de POST en navegador real, envío nativo bloqueado, layout, navegación física por teclado ni conformidad WCAG**. No hay capturas ni certificación visual de esta entrega. El bloqueo ambiental no es un defecto demostrado del formulario.

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

## Cierre pendiente

Ejecutar la batería Chromium en un entorno compatible, inspeccionar capturas de 375/1440 px y corregir cualquier regresión. La batería incluye 320/375/768/1024/1440 px, clic/Enter, menú móvil, privacidad, seis categorías, axe y bloqueo con y sin `data-preview-only`. Hasta obtener esa evidencia, **H02 no se declara RESUELTO**. El PR se presenta en borrador, sin merge ni despliegue.
