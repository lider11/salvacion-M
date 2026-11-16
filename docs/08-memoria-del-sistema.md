# Memoria canónica — Salvación M

## 2026-11-16 — Conciliación de versión de privacidad H03 y alerta de secretos

**Evidencia entregada por el titular:** el frontend del dominio de Hostinger enviaba `sm-hostinger-sintetico-v1`, mientras la configuración privada H03 mostró `sm-h03-staging-sintetico-v1`. Esto explica el `422` de `fields.consentimiento` si la API H03 mantiene el contrato observado; persiste la necesidad de corroboración con POST remoto.

**Corrección de código:** `index.html` de la rama aislada declara ahora `data-privacy-version="sm-h03-staging-sintetico-v1"`. La casilla, backend y secretos no fueron modificados. Solo procede ensayar con datos sintéticos y después de confirmar acceso protegido.

**Seguridad:** el contenido de configuración privada y credenciales se divulgó en una conversación. Tratar la contraseña MySQL y `email_hash_key` HMAC como comprometidas: rotarlas en Hostinger por canal privado sin publicarlas en GitHub ni en chats. Rotar HMAC puede reiniciar la correlación con ventanas de rate limiting previas; documentar operación con cuidado. Corregir `allowed_origins` si el archivo contiene literalmente sintaxis de enlace Markdown: debe ser un origen HTTPS puro.

**Resultado:** comprobaciones estáticas de HTML PASS; HTTP `201`, escritura MariaDB y configuración remota después del cambio `NOT_RUN`. Aviso jurídico y consentimiento público `NO_ACREDITADO`. Sin acceso hPanel ni despliegue remoto.


## 2026-11-16 — La casilla controla la habilitación de Enviar

**Solicitud:** que el clic de la casilla de lectura valide ese requisito y habilite `Enviar solicitud`, sin exigir una acción adicional de revisión previa.

**Implementación:** `js/formulario-api.js` mantiene el botón desactivado inicialmente, lo habilita al marcar y lo deshabilita al desmarcar, conservando el bloqueo de envíos ambiguos y el control del tiempo de espera `429`. El formulario aún valida los campos obligatorios al enviar. `index.html` actualiza la versión del recurso JS para evitar caché.

**Verificación:** 7/7 pruebas JavaScript con DOM simulado PASS: inicio deshabilitado, marcar habilita, desmarcar deshabilita, POST `201` con datos válidos y `consentimiento:true`, tratamiento del `422` del backend, nueva versión del script, sintaxis JS. No se efectuó despliegue ni solicitud remota en esta sesión.

**Bloqueo independiente:** la API de Hostinger aún rechaza el contrato de privacidad en capturas anteriores. Un clic reconocido no corrige diferencias de `privacy_notice_version`. No se alteraron las comprobaciones de consentimiento ni privacidad del servidor; la recepción de datos personales reales sigue sujeta a aprobación jurídica y verificación remota.


## 2026-11-16 — Retiro de restricciones artificiales de entrada

**Solicitud explícita:** retirar las tres restricciones que exigían el prefijo `Prueba` en nombre/descripcion y dominio de correo `@example.test`, que seguían activas después de simplificar los textos visibles.

**Corrección:** eliminadas las tres condiciones exclusivamente en `js/formulario-api.js`, manteniendo las validaciones normales de formato, longitud, consentimiento, ruta same-origin, bloqueo de reenvíos ambiguos y verificación de `privacy_version`. `index.html` incrementa el parámetro de versión del JavaScript para evitar caché del navegador.

**Evidencia:** 7/7 comprobaciones con simulación controlada PASS (nombre común, correo convencional normalizado, descripción válida, botón visible, origen permitido, construcción del POST, sintaxis JS). No hubo POST remoto, publicación ni escritura MySQL en esta sesión.

**Límites jurídicos y operativos:** la eliminación de estas restricciones permite enviar valores no sintéticos al backend si el código se despliega. Esto **no equivale** a aprobar el aviso de privacidad, autorización de tratamiento, acceso seguro ni puesta en producción. No subir a un sitio público para datos personales hasta superar esas verificaciones. La configuración privada de Hostinger y API H03 instalada no se han revisado en este cambio.


## 2026-11-16 — Alineación de staging con dirección Hostinger

**URL seleccionada por el titular:** `https://darkviolet-hippopotamus-789000.hostingersite.com/`. Se adopta como origen exacto del frontend de pruebas en la rama aislada `feat/formulario-hostinger-staging-20261115`.

**Archivos modificados:** `index.html` (origen declarado y `og:url`, nueva versión de JS), `privacidad.html` (referencia de URL de la página), `js/formulario-api.js` (endpoint absoluto de ruta `/api/requests.php` sobre el origen actual y comprobación de host, con localhost autorizado únicamente para desarrollo), `backend/config.example.php` (origen exacto, sin secretos), `docs/backend-hostinger.md` (rutas de despliegue, configuración requerida, estado real y controles).

**Rutas:** raíz `/`, `/#contacto`, `/privacidad.html`, `/api/requests.php`. El valor para `allowed_origins` es `https://darkviolet-hippopotamus-789000.hostingersite.com`, sin barra final. No se habilita CORS.

**Pruebas:** JavaScript sintácticamente válido y 8/8 comprobaciones con harness simulado PASS: POST bajo origen correcto, bloqueo de origen ajeno, localhost, noindex, URL del ejemplo PHP, enlaces de privacidad, metadatos y documentación. Verificación estática de la coincidencia de rutas y del `noindex` conservado.

**Pendientes / bloqueos:** el origen real almacenado en `private/salvacion.php` del hosting no se leyó ni cambió. Tampoco se verificó una nueva escritura MySQL, autenticación del directorio staging, HTTPS actual ni la URL remota desde esta sesión (herramienta de consulta pública no recuperó la página). El servidor conserva históricamente variante API H03 distinta de la fuente inspeccionada. No desplegar en producción, ni aceptar datos reales sin aviso jurídico válido y controles de acceso. El correo `info@salvacionm.com` es independiente del dominio web y no se modifica sin comprobar la cuenta de correo.

**Estado:** `CODE_DOMAIN_ALIGNMENT = TRUE` en rama, `REMOTE_DOMAIN_DEPLOYED = FALSE/NO_ACREDITADO`, `MYSQL_E2E = FALSE/NO_ACREDITADO`, `PRODUCTION_MODIFIED = FALSE`.


## 2026-11-16 — Saneamiento de cuatro hallazgos del formulario staging

**Alcance:** solo rama `feat/formulario-hostinger-staging-20261115`; sin despliegue de Hostinger ni cambios de producción, bases de datos o secretos.

**Correcciones:**
- Navegación de tarjetas: `data-servicio` incorporado a tres enlaces; preselección de radio, `scrollIntoView` compatible con movimiento reducido, `history.replaceState` sin salto por `location.hash`, margen CSS de 6 rem ante header fijo.
- Respuestas ambiguas: `submit` y `review` bloqueados en el mismo procedimiento. Para HTTP 429 inequívoco, se guarda `Retry-After`, no se reenvía automáticamente y se permite solo el intento manual después de la ventana; otros errores ambiguos permanecen bloqueados.
- Email: normalizado con trim y minúsculas en el control antes de aplicar validación y enviarlo. La validación definitiva continúa en PHP.
- Errores accesibles: corrección en vivo por `input`/`change`, limpieza de errores corregidos sin mover el foco y `aria-invalid` aplicado a todos los radios del grupo.

**Evidencia:** evaluación JavaScript en entorno controlado, 10/10 escenarios simulados PASS (incluye movimiento reducido, navegación, email, errores, consentimiento, 201, 422, 429, timeout y UUID inválido); 13/13 comprobaciones de estructura, sintaxis y contrato PHP PASS. El backend de la rama contempla JSON 201+UUID, 422 `validation_failed` y rechazo del honeypot `website`. Estas pruebas **no acreditan** MySQL ni despliegue real: API Hostinger H03 distinta, sin reconciliación verificada.

**Pendientes:** confirmar integración web/API/MySQL del release instalado con datos QA; verificar privacidad y consentimiento jurídico antes de cualquier dato real. La rama conserva `data-staging-synthetic=true` y limitaciones QA. No se autoriza producción.


## 2026-11-16 — Ajuste de textos del formulario Hostinger staging

**Solicitud:** retirar referencias visibles a pruebas técnicas y datos ficticios en el formulario.

**Cambios:** en `index.html` se simplificaron la etiqueta de lectura del aviso y su estado accesible; en `js/formulario-api.js` se armonizaron mensajes del checkbox y errores de validación. Se versionó el recurso JavaScript para evitar caché antigua.

**Límites:** el entorno de staging continúa sin autorización para solicitudes reales y conserva `data-staging-synthetic=true`, las restricciones de identificadores sintéticos y la validación del backend. No se modifica producción, MySQL ni configuración de privacidad.

**Verificación:** comprobación sintáctica JavaScript y aserciones de fuente PASS; E2E real de Hostinger y persistencia MySQL NO_ACREDITADOS. No se realizó despliegue remoto.


## 2026-11-15 — Hostinger: frontend instalado; E2E pendiente de acceso protegido

Fuente desplegada: `e70070b28158ea0057c939f7a06c2c1df2480fc9` (PR #21). Sesión hPanel autenticada con 2FA y verificada. Plan Business Web Hosting. Ruta comprobada: `/home/u270515629/domains/darkviolet-hippopotamus-789000.hostingersite.com/public_html`. PHP CLI 8.2.35, pdo_mysql y mbstring activos. Conexión PDO real a MariaDB 11.8.9-MariaDB-log PASS; tablas requests, request_rate_limits y request_network_rate_limits presentes. No se ha verificado aún una nueva escritura ni el esquema completo.

Antes de cambiar se creó `backups/sm-final-20261115/before.tgz` fuera del webroot: 14 entradas, SHA256 `ea08f394cc317e24e362e1d16f0dac348740981be73a0078245628c3f96b85f0`. Listado del archivo y extracción en stdout de default.php verificados; restauración completa NOT_RUN. Contiene configuración privada; no publicarlo. Se recuperó la rama directamente en una copia de trabajo del servidor, sin tocar el portátil ni stashes.

Se instalaron index.html, privacidad.html, css/, js/ y assets/. Nuevo public_html/.htaccess con DirectoryIndex index.html default.php y Options -Indexes. default.php conservado byte a byte: SHA256 `60ac62a68df8c20921467d735b12fda34fcf270b4069be63ed9f276c22b439ebbe`. private/ y backups/ modo 700; private/salvacion.php modo 600. No se reemplazaron API, backend, migraciones o secretos.

API desplegada conserva la variante H03 con límite por red; difiere de la API de PR #21 y no se declara reconciliada. SHA256 API instalada `a78bacaf5f7883e4324ae0f22b8021e0d8247d5626a617a931cc2fc7b1135910`; bootstrap `838e36f54a8caa449547e0deeb6833a313b08c890d84174a65fefeafaa35c888`; migración MySQL `7b897cd2fc74c22dde935f02248e8b43f0ff4c7ec98b4555dd9c6d95eaa9ba79`.

HTTPS raíz HTTP 200 y navegador muestran Salvación M. Validación vacía real muestra resumen de cinco errores y mueve foco al resumen PASS. Suite Node reejecutada sobre copia integrada conciliada: 13/13 PASS con mocks, no MySQL. No se atribuyen a la app los errores observados de una extensión chrome-extension. Visual móvil/tablet, zoom, contraste integral, E2E y rollback completo pendientes.

El formulario permanece data-preview-only=true y sin envío. Privacidad y producción no autorizadas. Configuración existente declara aviso QA `sm-hostinger-sintetico-v1`, no aprobación jurídica pública. No hubo POST en esta ejecución. El acceso al sitio aún no está protegido; se abrió hPanel > Directorios protegidos con contraseña, raíz /, usuario propuesto salvacionqa, para intervención del titular al crear la contraseña. No se habilita envío hasta verificar esa protección. G3 sigue retirado como gate global.

| Estado | Booleano | Diagnóstico |
| --- | --- | --- |
| FRONTEND_HOSTINGER_STAGING | TRUE | PASS |
| HTTPS | TRUE | PASS |
| PDO_MYSQL_CONEXION | TRUE | PASS |
| API_PHP_OPERATIVA | FALSE | NO_ACREDITADO |
| MYSQL_PERSISTENCIA | FALSE | NOT_RUN |
| FORMULARIO_E2E_STAGING | FALSE | BLOCKED |
| STAGING_PROTEGIDO | FALSE | BLOCKED |
| PRIVACIDAD_APROBADA | FALSE | NO_ACREDITADO |
| PRODUCCION_AUTORIZADA | FALSE | NO_ACREDITADO |
| FORMULARIO_PRODUCCION_OPERATIVO | FALSE | NOT_RUN |

## 2026-11-15 — Conciliación con archivo del portátil

Inspeccionado `salvacion-M(2).7z`: HEAD `3d6e7833040583851d23531050599fa932573675`, dos stashes conservados. Único cambio versionado de contenido, ignorando CRLF: `backend/migrate.php`. Frontend coincide con base del PR #21. Copia independiente integrada con frontend del SHA remoto `11c2d75d655962a4b5ccc2d560a7541038867281`; migrador, work y output preservados. Sintaxis JS PASS, Node 13/13 PASS en esa copia. Sin cambios del portátil, sin POST ni despliegue. Migrador local pendiente de revisión MySQL; excluido del PR frontend. Detalle: `docs/conciliacion-portatil-20261115.md`.

## 2026-11-15 — Integración frontend/API en rama aislada

Base `3d6e7833040583851d23531050599fa932573675`. Nuevo módulo `js/formulario-api.js`, integración en `index.html`, retiro de controlador duplicado en `js/main.js`, estado CSS y 13 pruebas mock PASS. Aplicador Python 1/1 PASS; sintaxis y diff PASS. Corregida validación de ciudad sin letras. Envío sigue bloqueado. Sin modificaciones de backend, MySQL o producción.

Staging observado: «Próximamente». Publicación BLOCKED por restricción de acceso cloud a hPanel; navegador no alcanzó localhost. Visual/móvil/teclado NOT_RUN. Checkout Windows no accesible. Informe y rollback condicionado en `docs/formulario-hostinger-fase2-20261115.md`; log Node en `docs/evidencias/formulario-node-20261115.txt`. SHA de entrega en historial de esta rama; PR en borrador, sin fusión.

## 2026-11-15 — Retiro expreso de G3 como requisito global

**Decisión del titular:** deshabilitar el Gate G3 por provenir de un SDD que creó obligaciones excesivamente complejas. Se confirma su retiro de la gobernanza vigente de la rama `main`. No exigir siete criterios, `G3_PASS`, estados del gate ni ceremonias SDD como condiciones para terminar tareas.

**Alcance:** se conserva todo el historial anterior de Sites/QA y G3 sin borrar evidencias ni presentar resultados antiguos como vigentes. Los controles efectivos de seguridad, protección de datos, accesibilidad, persistencia y pruebas proporcionales al cambio continúan siendo exigibles. El retiro de G3 no significa que Hostinger, CRM, scheduler o producción estén verificados ni activados.

**Cambios documentales:** `AGENTS.md`, `README.md` y esta memoria. No se modifica código ejecutable ni se realiza despliegue. Verificar coherencia documental y SHA del nuevo commit.

## 2026-11-15 — Consolidación para GitHub

**Cambio:** consolidación del logo, revisión local del formulario, borrador de privacidad y API PHP con guía Hostinger. Se excluyen work/ y capturas temporales. El envío público sigue bloqueado.

**Verificación actual:** node --check en js/main.js y js/social.js, y git diff --check correctos. PHP no disponible en esta sesión: pruebas backend NO VERIFICADAS nuevamente; los resultados anteriores permanecen como históricos. Hostinger y staging NO VERIFICADOS. Sin despliegue.

**Riesgos:** privacidad y retención pendientes; MySQL real y operación pendientes. SHA base: 7d99ffe; SHA de consolidación disponible en el historial Git.

## 2026-11-15 — Finalidad y responsable declarados

**Cambio:** borrador de privacidad 0.2: responsable declarado Salvación M y finalidad limitada al contacto telefónico solicitado. Revisión manual por el responsable del proyecto documentada en la guía de Hostinger. Identificación legal, canal de derechos y reglas de conservación siguen pendientes; no se activan consentimiento ni envío.

**Riesgos:** conservación a criterio personal requiere concretar reglas; teléfono opcional debe revisarse antes de activar llamadas.

**Verificación:** revisión del diff y comprobaciones de contenido; navegador y staging NO VERIFICADOS. SHA base `7d99ffe`; cambios locales sin commit ni despliegue.

## 2026-11-15 — Confirmación y revisión del formulario

**Problema:** la casilla de lectura estaba deshabilitada y el estado de revisión permanecía oculto; la persona no recibía una respuesta visible.

**Corrección:** casilla activa que solo confirma haber consultado el aviso en borrador (no constituye consentimiento); la revisión valida esa confirmación y muestra errores o un resultado informativo. El envío continúa bloqueado y no se transmiten ni guardan datos.

**Verificación:** interacción real en Chromium; errores visibles y foco en resumen; revisión válida visible; Playwright: todos los chequeos UI pasan, axe sin violaciones en Contacto, cero solicitudes POST y sin overflow en los tamaños probados.

## 2026-11-14 — API PHP inicial para Hostinger

**Decisión:** PHP 8.2+ con PDO y MySQL para la API de solicitudes; SQLite solo para desarrollo/pruebas. El frontend permanece en vista previa y no está conectado.

**Implementación:** `api/requests.php`, validación de payload, comprobación de origen, persistencia transaccional, versión de consentimiento obligatoria, consultas preparadas y límite por correo HMAC. Configuración privada y migración fuera del webroot documentadas en `docs/backend-hostinger.md`.

**Verificación:** PHP 8.2.12 local; `php -l` en todos los PHP y 16 pruebas HTTP/SQLite aprobadas. MySQL real de Hostinger y despliegue: NO VERIFICADOS. No se envían ni guardan datos desde el portal todavía.

## 2026-11-14 — Logo de abrazo aportado por el responsable

**Cambio:** imagen PNG original incorporada en `assets/logo-salvacion-m.png`; reemplazo en cabeceras, pie e iconos de pestaña de inicio y privacidad. Contenedores blancos con esquinas redondeadas para conservar contraste y evitar recorte circular.

**Pruebas:** SHA-256 de la copia idéntico al archivo aportado; cinco referencias HTML actualizadas; `git diff --check` correcto. Visualización en navegador y legibilidad del texto dentro del logo a tamaños pequeños: NO VERIFICADO.

**Riesgos:** el texto integrado en el PNG puede resultar pequeño en cabecera y favicon; se conserva el nombre textual de la marca. Sin despliegue. SHA base: `7d99ffe65e4f3c75f10728348c16b804a54d5e26`; cambios locales sin commit.

## 2026-11-14 — Recuperación de la composición visual

**Causa:** la conciliación dejó variantes duplicadas del formulario y secciones HTML básicas sin el marcado y los estilos del diseño trabajado.

**Corrección:** se recuperaron Servicios, Nosotros y Proceso desde el respaldo local; se conservó el hero vigente y un solo formulario de vista previa con seis categorías, envío bloqueado y aviso de privacidad.

**Verificación:** HTML y CSS sin errores de validación; Playwright en 320, 375, 768, 1024 y 1440 px sin overflow; zoom 200 % a 375 px sin overflow global; axe sin violaciones en Contacto. No se desplegó.

## 2026-11-14 — UX formulario P0

**Cambio:** un solo aviso de sistema; CTA primario “Validar datos”; Enviar oculto/deshabilitado; labels con `*` simple; datos y servicios en rejilla 2 columnas; preselección de servicio desde tarjetas; estado oculto hasta interactuar; un solo foco al primer error.

## 2026-11-14 — Retiro de sección Transparencia y alcance

**Cambio:** se elimina `#transparencia` del portal y sus enlaces en nav/pie. Los mensajes de gratuidad y límites siguen en contacto/footer según aplique.

## 2026-11-14 — Servicios en rejilla 2×3 (propuesta A)

**Cambio:** la sección de dificultades deja la columna única; en escritorio/tablet usa 2 columnas × 3 filas; en móvil permanece 1 columna.

**Estado:** solo CSS; sin cambio de copy ni de destinos de enlace.

## 2026-11-14 — Integración de avances locales (Visual Studio)

**Origen:** archivos aportados por el responsable (`index.html`, `privacidad.html`, etc.).

**Se incorporó:** rediseño de servicios/nosotros/proceso, formulario preview-safe (`method="dialog"`, envío deshabilitado, “Revisar campos”), aviso de privacidad ampliado, footer con canales de contacto.

**Se conservó de la línea canónica:** docs simplificados (sin G3/SDD), 6 servicios del ADN, sección, contraste de nav y regla de no fake-success.

**No se incorporó:** `README`/`AGENTS` antiguos con Gauntlet/G3; `package-lock.json` sin `package.json` (tooling pendiente de decisión explícita).

**Estado:** UI enriquecida; envío real pendiente de API.

## 2026-11-11 — Portal: contenido ADN y formulario sin fake-success

**Cambio:** ampliar servicios (6), sección de transparencia, aviso de privacidad borrador (`privacidad.html`) y formulario accesible en `#contacto`.

**Regla de producto:** el envío intenta `POST /api/v1/requests`; si no hay API o no hay identificador, se muestra error claro y no se simula éxito. Consentimiento no preseleccionado.

**Verificación prevista:** `node --check js/main.js`; prueba manual de validación y mensaje de no disponibilidad.

**Estado:** UI de solicitud lista; persistencia pendiente; texto de privacidad sujeto a revisión jurídica; producción sin cambios.

## 2026-11-11 — Unificación de rama y docs (salida del SDD complejo)

**Decisión:** consolidar la línea canónica en `main`. Abandonar el enfoque SDD extenso (especificaciones por módulo, gates globales tipo G3, artefactos de verificación acumulativos) que generó complejidad sin acelerar el producto.

**Qué se conserva del reinicio:**

- Frontend HTML5 / CSS3 / JavaScript Vanilla.
- Backend previsto Node.js LTS + Express (cuando se implemente).
- Retiro de G3 / `G3_PASS` como mandato.
- Método corto: inspeccionar → diseñar → implementar → probar → documentar.
- GitHub solo como fuente e historial; no tocar producción sin autorización.

**Qué no se incorpora ahora:**

- Los tres documentos largos `docs/backend/*` de `reinicio-2026-desde-cero` (quedan históricos en esa rama).
- El rediseño y el andamiaje SDD/Playwright de `trabajo-proceso-001` (revisión futura, sin arrastrar burocracia).

**Cambios en repo:** README, AGENTS, arquitectura y esta memoria alineados al estado real. Se elimina `css/styles.css` huérfano. ADN e identidad dejan de exigir G3.

**Estado:** `LINEA_CANONICA = main`; `SDD_EXTENSO = RETIRADO`; `G3 = RETIRADO`; landing parcial en código; formulario/API/CRM pendientes.

---

## 2026-11-08 — Primera página pública local

**Cambio:** página HTML con estilos responsive, cabecera con logo, navegación móvil en JavaScript Vanilla y hero con imagen aportada por el responsable. Incluye secciones de servicios, presentación, proceso y contacto informativo; no recibe solicitudes.

**Riesgos y alcance:** formulario y persistencia pendientes; la imagen es ilustrativa y no acredita prestación clínica. Sin cambios a producción.

**Verificación:** sintaxis JavaScript comprobada con `node --check js/main.js` (PASS). Recursos locales y destinos de enlaces se verifican antes del commit. Pruebas visuales, interacción en navegador y auditoría WCAG: NOT_RUN. No se acreditan los siete criterios de G3; `G3_PASS = FALSE`.

## 2026-11-08 — Servicios, propuesta 3 (SM-FRONT-SERVICIOS-003)

**Cambio local:** rediseño exclusivo de #servicios con fondo marino, tarjetas blancas apiladas, SVG decorativos y CTA dorado a #contacto. Contacto mantiene el estado informativo del formulario. Sin cambios en JavaScript, CRM ni servicios internos.

**Rama:** trabajo-servicios-opcion-3. **SHA base:** a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d. Sin commit, push ni despliegue; producción sin modificar.

**Verificación:** pruebas Chromium a 320/375/768/1024/1440 px, teclado, enlaces, contraste calculado, consola, CSS y comparación de estilos externos. Evidencia y matriz en docs/SM-FRONT-SERVICIOS-003.md y output/playwright/. Se corrigieron caracteres dañados durante escritura. Cabecera conserva un error HTML preexistente fuera del alcance. Axe no encontró violaciones confirmadas en servicios, pero dejó contraste incompleto; accesibilidad integral NO_ACREDITADO.

**Estado:** implementación local terminada; G3_PASS = FALSE.

## 2026-11-08 — Consolidación autorizada de rediseños frontend

**Autorización:** el responsable autorizó crear commit y publicar la rama de trabajo en GitHub. Rama de consolidación: trabajo-proceso-001; base a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d.

**Alcance:** Servicios, Nosotros y Proceso; HTML/CSS, informes SM-FRONT-SERVICIOS-003, SM-FRONT-NOSOTROS-003 y SM-FRONT-PROCESO-001 y evidencias en output/playwright. Los informes describen el estado previo al commit; sus menciones a «sin commit/push» son históricas.

**Verificación:** pruebas y limitaciones detalladas en los informes; revisión final del diff sin errores. No se acredita WCAG integral ni Gate G3. G3_PASS = FALSE. No se despliega ni se modifica main o producción. Archivos locales ajenos excluidos: privacidad.html, work/ y assets/hero-acompanamiento.svg.

**Verificación histórica:** `node --check js/main.js` (PASS). Pruebas visuales/WCAG: NOT_RUN en ese momento.

## 2026-11-02 — Logo vectorial aprobado e incorporado

**Aprobación expresa:** símbolo SVG de arco protector azul, cruz dorada y mano dorada.

**Archivos:** `assets/logo-salvacion-m.svg`, `assets/logo-salvacion-m-monocromo.svg`, `docs/IDENTIDAD-GRAFICA-LOGO.md`.

**Estado:** logo aprobado e integrado en la landing; contraste sobre fondos oscuros sigue sujeto a revisión visual.

## 2026-11-02 — ADN v2.0 e identidad institucional premium

**Decisión:** dirección visual institucional premium (azul marino, blanco, acentos dorados discretos).

**Archivos:** `docs/ADN-MAESTRO-V2.md`, `docs/SISTEMA-DISENO-V2.md`.

**Estado:** documentación de marca vigente como guía; no sustituye implementación ni pruebas.

## 2026-11-02 — Reinicio controlado

**Decisión histórica:** línea limpia en `reinicio-2026-desde-cero` preservando historial de `main`. Motivó el corte con artefactos operativos previos.

**Nota 2026-11-11:** esa rama queda histórica tras la unificación; el trabajo activo vuelve a `main` con proceso simplificado.
