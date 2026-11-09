# Memoria canónica — Salvación M

## 2026-11-02 — Reinicio controlado

**Decisión:** crear una línea de trabajo limpia en `reinicio-2026-desde-cero` preservando `main` y su historial.

**Motivo:** retirar el código, configuraciones y artefactos operativos heredados para reconstruir por fases con verificación.

**Cambio:** primer commit de limpieza con solo `README.md`, `AGENTS.md`, `docs/08-memoria-del-sistema.md`, `docs/arquitectura-inicial.md` y `.gitignore`.

**Restricciones:** no modificar producción ni `main`; GitHub solo es fuente e historial. No hay secretos ni destinatarios configurados.

**Validación prevista:** verificar SHA, contenido exacto del árbol y rama de destino tras el commit.

**Pendientes:** diseño funcional; frontend accesible; API y D1; CRM; seguridad; pruebas; Sites QA; scheduler; recordatorios e idempotencia; auditoría G3.

**Estado:** `G3_PASS = FALSE`; 0/7 criterios acreditados para la nueva base. La creación del commit no equivale a despliegue.

## 2026-11-02 — ADN v2.0 e identidad institucional premium

**Decisión aprobada por el responsable:** adoptar la dirección visual Institucional premium (azul marino, blanco y acentos dorados discretos).

**Implementación documental:** se añadieron `docs/ADN-MAESTRO-V2.md` y `docs/SISTEMA-DISENO-V2.md` con propósito, audiencias, mensajes, recorrido, tokens, componentes, reglas de accesibilidad, seguridad y criterios de aceptación.

**Alcance:** solo documentación en `reinicio-2026-desde-cero`; no se modificaron `main` ni producción, ni se implementó el sitio.

**Verificación pendiente:** comprobar archivos y commits en GitHub; evaluar contrastes, interfaz, QA y accesibilidad al construir el frontend.

**Estado:** `ADN_DOCUMENTADO = TRUE`; `DESIGN_SPEC = TRUE`; `IMPLEMENTACION_WEB = FALSE`; `G3_PASS = FALSE`.

## 2026-11-02 — Logo vectorial aprobado e incorporado

**Aprobación expresa:** símbolo SVG de arco protector azul, cruz dorada y mano dorada.

**Archivos incorporados en rama de reinicio:** `assets/logo-salvacion-m.svg`, `assets/logo-salvacion-m-monocromo.svg`, `docs/IDENTIDAD-GRAFICA-LOGO.md`.

**Restricciones:** sin cambios a `main` o producción. No equivale a integración de frontend ni certificación WCAG. La versión principal tiene un espacio negativo blanco interior que requiere revisión sobre fondos oscuros.

**Estado:** `LOGO_APROBADO=TRUE`; `FRONTEND_INTEGRADO=FALSE`; `G3_PASS=FALSE`.

## 2026-11-08 — Primera página pública local

**Cambio:** página HTML con estilos responsive, cabecera con logo, navegación móvil en JavaScript Vanilla y hero con imagen aportada por el responsable. Incluye secciones de servicios, presentación, proceso y contacto informativo; no recibe solicitudes.

**Riesgos y alcance:** formulario y persistencia pendientes; la imagen es ilustrativa y no acredita prestación clínica. El borrador de privacidad, los wireframes de trabajo y el SVG sustituido quedan fuera de este commit. Sin cambios a producción ni a `main`.

**Verificación:** sintaxis JavaScript comprobada con `node --check js/main.js` (PASS). Recursos locales y destinos de enlaces se verifican antes del commit. Pruebas visuales, interacción en navegador y auditoría WCAG: NOT_RUN. No se acreditan los siete criterios de G3; `G3_PASS = FALSE`.

## 2026-11-08 — Decisión Node.js + Express y simplificación de calidad

**Decisión del responsable:** abandonar Sites como runtime y adoptar Node.js LTS + Express para la API, el CRM, las solicitudes, las citas y los recordatorios. Conservar frontend HTML5/CSS3/Vanilla JS y GitHub solo para fuente e historial. Base de datos y hosting sujetos a inventario y selección antes de migración.

**Decisión de gobierno:** retirar G3 y la condición G3_PASS del proceso futuro. La calidad se comprobará por módulo con pruebas técnicas y evidencia, sin gates globales. Las menciones antiguas a G3 de esta memoria se conservan solo como registro histórico de decisiones anteriores, no como mandato vigente.

**Archivos nuevos:** `docs/backend/01-arquitectura-node-express.md`, `docs/backend/02-api-datos-seguridad.md`, `docs/backend/03-operacion-pruebas-y-roadmap.md`. Actualizados README, AGENTS, arquitectura inicial y ADN maestro.

**Estado:** arquitectura documentada; backend no implementado, despliegue no acreditado, producción sin cambios.
