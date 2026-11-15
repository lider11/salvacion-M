# SM-FRONT-CONTACTO-001 — inspección y riesgos

> Vigencia (2026-11-15): informe histórico; conserva los resultados de su fecha. Las menciones a G3/SDD/D1 no son obligaciones de la línea actual. Arquitectura vigente: [PHP/PDO/MySQL y Hostinger previsto](arquitectura-inicial.md).

Fecha: 2026-11-08. Rama trabajo-contacto-001; SHA base 4e1775de3c70dbd714740f6b9229c22734246adc. README, AGENTS, memoria, arquitectura y documentación de diseño revisados. HTML activo index.html; CSS css/style.css; JS js/main.js. Copias previas en output/playwright/contacto/.

Inventario y búsqueda de endpoints, fetch, tablas, CSRF y categorías: solo documentación de arquitectura prevista; no hay backend, contratos de recepción, CRM ni esquema D1 verificables. No se inventan códigos de API: valores de radio solo textos visibles de interfaz, sin contrato de serialización.

privacidad.html es un archivo local preexistente sin seguimiento: borrador 0.1 con responsable, identificación, domicilio y canales pendientes. Finalidades y derechos aparecen como borrador, no acreditan política vigente ni consentimiento demostrable. Se conserva sin modificar. No se enlaza como política vigente ni se añade enlace roto a un documento no versionado.

Riesgos previos: exposición accidental por envío nativo, consentimiento ficticio, datos sensibles en texto libre, XSS en errores, regresiones de CSS/JS. Mitigación: form method=dialog, envío disabled desde HTML, handler bloquea submit, sin fetch/storage/logs/payload; revisión local separada, mensajes textContent, etiquetas e instrucciones visibles. Consentimiento required pero disabled y desmarcado hasta contar con política aprobada. No se simula autorización válida.

Decisión de la orden: envío real BLOCKED por API, privacidad, seguridad, persistencia y CRM no acreditados. Construir interfaz verificable sin servicios paralelos. Archivos previstos: index.html, css/style.css, js/main.js, informe y evidencias. Sin modificación de producción, commit o push.

Método: planificar, construir, probar, criticar, corregir, verificar; máximo dos rondas adversariales y tres correcciones. Terminación: UI y validaciones locales probadas, bloqueos explícitos y sin defectos altos/críticos nuevos en el alcance.

## Implementación y contrato

HTML de #contacto actualizado en index.html; reglas CSS nuevas limitadas a #contacto; módulo aislado en js/main.js. Conservados #contacto, .container y #contacto-titulo. Sin cambios de comportamiento a módulos existentes ni backend. Sin carga de archivos, cédula o dirección residencial.

Nombre 3–100; email hasta 254 y formato nativo; teléfono opcional 7–15 dígitos y máximo 25 caracteres; municipio opcional hasta 100; descripción 20–1000. Validación usa Unicode para nombres y localidades, sin exigir exactamente dos palabras. Textos y errores se insertan con textContent. Radios usan textos de servicio como valores de interfaz exclusivamente: NO son códigos CRM ni un contrato aprobado.

Contrato API utilizado: ninguno. No se implementan fetch, serialización, estados de éxito, reintentos de API ni promesas de persistencia sin backend. La revisión exitosa solo significa que los campos cumplen reglas locales. Autorización required, disabled y sin marcar; no registra consentimiento. No se enlaza la política porque no existe una versión vigente acreditada. Para habilitarla deberán verificarse URL publicada, responsable y canales, finalidades, derechos, versión y prueba de consentimiento; después verificar endpoint, controles y persistencia antes de sustituir el bloqueo.

El método dialog impide el envío HTTP nativo en esta vista fuera de un diálogo; además el botón submit está disabled y el handler submit cancela toda activación. No es una configuración de producción ni una protección de backend. No hay almacenamiento, logs ni terceros añadidos. La validación local no sustituye la validación del servidor ni garantiza detectar datos médicos en texto libre.

## Privacidad: fuentes oficiales consultadas

Revisión documental, no certificación jurídica: Ley 1581/2012, arts. 5, 6, 9 y 12: datos de salud sensibles, autorización previa e informada y deber de información. Fuente: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

Decreto 1074/2015, art. 2.2.2.25.3.1: contenido mínimo de políticas; contrastado con los pendientes del borrador local. Fuente oficial: https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?0=&i=76608 y concepto SIC https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/politicas-de-tratamiento-de-datos-personales

No se acredita cumplimiento legal integral. La casilla no habilita tratamiento de datos sensibles. Envío BLOCKED por orden explícita del responsable ante falta de política y mecanismos acreditados.

## Pruebas ejecutadas

Playwright/Chromium con datos sintéticos, html-validate, css-tree y axe-core locales; sin nuevas dependencias. Servidor efímero loopback cerrado al terminar. Reproducción: node output/playwright/contacto/verificar.cjs; node output/playwright/contacto/resumir.cjs. La segunda orden genera diff y consolidación con salida no cero si falla UI, responsive, regresiones, CSS, consola o axe confirmado.

| Prueba | Diagnóstico | Evidencia |
|---|---|---|
| HTML de Contacto | PASS | Cero mensajes en sección tras corrección |
| HTML global | FAIL_REAL previo | Figure dentro de span en cabecera, igual al baseline; fuera de alcance |
| CSS y JS | PASS | css-tree sin errores; node --check js/main.js |
| Obligatorios y formatos | PASS | Casos ui: resumen con 4 errores, nombre, email, teléfono, municipio |
| Tres servicios | PASS | Cada radio seleccionable y exactamente una selección |
| Longitudes | PASS | Casos nombre 101, ciudad 101, email >254, descripción 1000/1001; límites en HTML y JS |
| Autorización | BLOCKED | Casilla desmarcada y deshabilitada; no hay política aprobada ni evidencia de consentimiento |
| Envíos repetidos y forzados | PASS del bloqueo | Doble clic, requestSubmit repetido, Enter y submit nativo: ninguna transmisión ni navegación; no prueba idempotencia del servidor |
| Fallos de validación | PASS | Mensajes próximos, aria-invalid, resumen enfocable con enlaces al campo; valores conservados |
| XSS de interfaz | PASS acotado | Municipio rechaza markup; texto de descripción no se interpreta como HTML; errores con textContent; sin prueba de backend |
| Storage | PASS | localStorage/sessionStorage vacíos; sin uso en módulo |
| Sin JavaScript | PASS | Envío disabled y revisión local oculta; no se simula envío |
| Teclado | PASS acotado | Enlace de resumen lleva al campo; foco en textarea y botón mediante Shift+Tab/Tab, contorno sólido |
| Responsive | PASS | 320, 375, 768, 1024, 1440 px sin overflow; 1/2 columnas según ancho |
| Zoom CSS 200 % | PASS de sección | Ningún descendiente de Contacto sale de sus límites a 1440/375 |
| Zoom CSS 200 % global móvil | FAIL_REAL fuera del formulario | Overflow de documento a 375; formulario sin desbordar; no se modifica otra sección ni se acredita zoom global |
| axe | PASS automático | Cero violaciones e incompletos tanto vacío como con errores; etiquetas, foco, contraste y objetivos táctiles |
| Consola | PASS | Cero pageerror o console.error |
| Regresiones | PASS acotado | HTML fuera de Contacto idéntico; 30 comparaciones de estilos de todos los descendientes de cabecera, Hero, Servicios, Nosotros, Proceso y footer idénticas |
| Confirmación real / errores de API | BLOCKED | Sin endpoint verificado; no simulados |
| Persistencia D1 / CRM | BLOCKED | No implementados ni acreditados en esta base |
| Servidor: SQL, CSRF, RBAC, auditoría, antiabuso | BLOCKED | No existe servicio verificable; sin afirmaciones de seguridad |
| Lector de pantalla / WCAG integral | NOT_RUN | No se acredita conformidad integral |

30 casos ui aprobados, persistidos en resultados.json. Capturas vacías sin datos personales: contacto-375.png y contacto-1440.png inspeccionadas visualmente. Método de zoom CSS automatizado no equivale a ensayo manual de zoom de navegador.

## Crítica adversarial

Ronda 1: revisión de arquitectura, integraciones, privacidad, envío accidental, validaciones y resultados. Hallazgo de validador: for redundante en labels que envuelven sus controles. Retirado conservando asociación implícita. Un ciclo de corrección. Corregida también una expresión regular del verificador antes de ejecutar pruebas; no fue un defecto de producto.

Ronda 2: pruebas repetidas y ampliadas de límites y axe en errores, revisión de capturas, JS y diff. Todos los 30 casos pasan; cero incidencias axe confirmadas o incompletas. No se detectan defectos críticos/altos nuevos en la interfaz acotada. Los bloqueos de backend/privacidad son condiciones de habilitación pendientes, no funcionalidades aprobadas ni defectos ocultos. Persisten el HTML inválido de cabecera y el límite global de zoom fuera de alcance.

## Matriz del árbitro

| Criterio | Resultado | Diagnóstico y evidencia |
|---|---|---|
| Formulario HTML implementado | TRUE | PASS; index.html y validador |
| Tres servicios disponibles | TRUE | PASS; tres selecciones probadas |
| Validación frontend | TRUE | PASS; 30 casos ui, límites y errores |
| Autorización de datos | FALSE | BLOCKED; política sin acreditar, casilla inactiva |
| Diseño responsive | TRUE | PASS; cinco tamaños y capturas |
| Accesibilidad acreditada integral | FALSE | NO_ACREDITADO; axe pasa, lector de pantalla y auditoría integral pendientes |
| Seguridad del servidor | FALSE | BLOCKED; servicio no verificado |
| API verificada | FALSE | BLOCKED; contrato no disponible |
| Persistencia D1 | FALSE | BLOCKED; sin integración |
| Integración CRM | FALSE | BLOCKED; sin implementación |
| Pruebas E2E de recepción persistida | FALSE | BLOCKED; solo pruebas de navegador de UI y bloqueo |
| Producción sin modificar | TRUE | PASS; solo archivos locales y pruebas loopback |

## Entrega y estado final

Producto: index.html, css/style.css, js/main.js. Documentación: este informe. Evidencias bajo output/playwright/contacto/: antes.html/css/js, verificar.cjs, resumir.cjs, resultados.json, cambios.diff y dos capturas. El diff compara con el estado exacto previo; hashes de baseline en resultados.json. Los archivos locales ajenos preexistentes quedan intactos.

Rama trabajo-contacto-001; SHA inicial y final de HEAD 4e1775de3c70dbd714740f6b9229c22734246adc. Sin commit, push o despliegue. La autorización Git previa correspondía a los rediseños anteriores; esta orden excluye publicación sin nueva autorización.

UI de desarrollo/QA terminada con pruebas disponibles ejecutadas y bloqueos visibles. Para recepción real faltan política aprobada con URL y responsable/canales, prueba de consentimiento, contrato y categorías CRM, endpoint seguro con validación de servidor, antiabuso, CSRF según modelo, persistencia, auditoría y verificación E2E. No se crean tablas ni API paralela. G3_PASS = FALSE.
