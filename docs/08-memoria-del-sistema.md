# Memoria canónica — Salvación M

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

> Antecedente sustituido: el frontend actual no envía solicitudes; la API inicial usa `/api/requests.php`, cerrada por defecto.

**Cambio:** ampliar servicios (6), sección de transparencia, aviso de privacidad borrador (`privacidad.html`) y formulario accesible en `#contacto`.

**Regla de producto:** el envío intenta `POST /api/v1/requests`; si no hay API o no hay identificador, se muestra error claro y no se simula éxito. Consentimiento no preseleccionado.

**Verificación prevista:** `node --check js/main.js`; prueba manual de validación y mensaje de no disponibilidad.

**Estado:** UI de solicitud lista; persistencia pendiente; texto de privacidad sujeto a revisión jurídica; producción sin cambios.

## 2026-11-11 — Unificación de rama y docs (salida del SDD complejo)

> Antecedente: la previsión Node/Express fue sustituida por PHP/PDO/MySQL el 2026-11-14 y reconciliada mediante H01 el 2026-11-15. Los resultados originales se conservan.

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
