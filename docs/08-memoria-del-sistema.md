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

## 2026-11-08 — Servicios, propuesta 3 (SM-FRONT-SERVICIOS-003)

**Cambio local:** rediseño exclusivo de #servicios con fondo marino, tarjetas blancas apiladas, SVG decorativos y CTA dorado a #contacto. Contacto mantiene el estado informativo del formulario. Sin cambios en JavaScript, CRM ni servicios internos.

**Rama:** trabajo-servicios-opcion-3. **SHA base:** a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d. Sin commit, push ni despliegue; producción sin modificar.

**Verificación:** pruebas Chromium a 320/375/768/1024/1440 px, teclado, enlaces, contraste calculado, consola, CSS y comparación de estilos externos. Evidencia y matriz en docs/SM-FRONT-SERVICIOS-003.md y output/playwright/. Se corrigieron caracteres dañados durante escritura. Cabecera conserva un error HTML preexistente fuera del alcance. Axe no encontró violaciones confirmadas en servicios, pero dejó contraste incompleto; accesibilidad integral NO_ACREDITADO.

**Estado:** implementación local terminada; G3_PASS = FALSE.

## 2026-11-08 — Consolidación autorizada de rediseños frontend

**Autorización:** el responsable autorizó crear commit y publicar la rama de trabajo en GitHub. Rama de consolidación: trabajo-proceso-001; base a1f1fafdcb03c33b1f31c6ea40b47bf44ac2702d.

**Alcance:** Servicios, Nosotros y Proceso; HTML/CSS, informes SM-FRONT-SERVICIOS-003, SM-FRONT-NOSOTROS-003 y SM-FRONT-PROCESO-001 y evidencias en output/playwright. Los informes describen el estado previo al commit; sus menciones a «sin commit/push» son históricas.

**Verificación:** pruebas y limitaciones detalladas en los informes; revisión final del diff sin errores. No se acredita WCAG integral ni Gate G3. G3_PASS = FALSE. No se despliega ni se modifica main o producción. Archivos locales ajenos excluidos: privacidad.html, work/ y assets/hero-acompanamiento.svg.
