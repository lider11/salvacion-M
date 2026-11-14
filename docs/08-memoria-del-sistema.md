# Memoria canónica — Salvación M

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
