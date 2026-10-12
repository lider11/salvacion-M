# G3 — ejecución autónoma del 12 de octubre de 2026

G3_STATUS: READY_FOR_VERIFICATION. No RC final acreditado todavía.

## Fase E: evidencia viva y bloqueo

Workflow vigente `.github/workflows/qa-appointment-reminders.yml` en main: `workflow_dispatch`, booleano auth_only, environment qa, health GET sin envío, OAI-Sites-Authorization y secreto REMINDER_TRIGGER_TOKEN separado. Run programado 38214936354, job 114697367147, 2026-10-12T06:55:22Z: `site_auth HTTP: 401`, `SITE_AUTH_HTTP_401`. No se alcanzó POST. Evidencia: https://github.com/lider11/salvacion-M/actions/runs/38214936354 . No se atribuye un SHA al run sin obtener su metadata.

El navegador abrió el workflow y mostró Sign in, sin Run workflow; el conector no expone workflow_dispatch ni escritura de secrets. La nueva ejecución auth_only no fue realizada. Los valores de secrets no fueron leídos ni revelados. Se continúa el trabajo independiente.

## Implementación

- Timeout y prohibición de redirecciones para solicitudes al proveedor, usando el límite técnico ya presente de 30 segundos en el scheduler.
- Resultado de red/timeout o recibo ilegible exitoso: `unknown_requires_review`. Se conserva reserva UNIQUE; repetición no vuelve a enviar. Un pending por interrupción o por fallo al persistir también bloquea el reenvío y requiere conciliación manual del proveedor. No existe reintento automático de POST.
- Monitor agrupa unknown con pendientes de revisión y lo identifica explícitamente.
- Bootstrap usa INSERT SELECT WHERE NOT EXISTS dentro de DB.batch, preservando exclusión del primer ADMIN ante concurrencia. Auditoría y alta siguen juntas.
- Login CRM rechaza Origin diferente antes de llamar al backend.
- CI: lockfiles raíz y CRM, npm ci, Actions con SHA obtenido del tag upstream; job QA con Node 24.19.0, build, validación, pruebas, integridad de migraciones, sintaxis JS, contratos del workflow, manifest SHA256 y escaneo limitado de patrones sensibles. El escaneo no acredita ausencia universal de secretos.

## Validación local

Gates 46/46; CRM 15/15. Incluye resultados ambiguos, recibo ilegible, persistencia, idempotencia, CSRF y RBAC. Proveedores de pruebas simulados; no acreditan entrega real. Integridad SQLite de migraciones 0000–0007, reaplicación segura de 0007, syntax check de fuentes y YAML-inline JS: PASS local.

## Decisiones funcionales pendientes

La documentación vigente usa ventana +23/+25h. La auditoría anterior propone recuperación now<scheduled_at<=now+24h, pero no registra aprobación funcional del cambio. Se conserva la ventana vigente; las interrupciones largas pueden perder elegibilidad. No se inventan backoff, número de reintentos o umbrales de rate limiting.

Auth especificado en `sites/salvacion-m-crm-qa/docs/auth-v2.md`: 210000 iteraciones. La auditoría exige política 600000 sin especificación aprobada encontrada. No se implementa esa migración. Falta política de rate limiting y compatibilidad viva de credenciales históricas: se añadió verificación de salt textual de v17 y salt bytes canónico a 210000, ambas contrastadas con Node y rechazo de contraseña incorrecta. No se cambia la credencial ni se reduce el coste. Falta prueba viva.

## Reconciliación

Fuentes abiertas mediante Sites: Gates 0bb2e15235a3ac0eb580cd95ff05e8e745b0e02f/v17; CRM 76fa817059744616423bbc79dd190565a68565d9/v11. Matriz por archivo: `g3-reconciliation-before-2026-10-12.json`; hashes son SHA256 del contenido, no SHA Git de blob. Gates difiere en runtime y pruebas. CRM desplegado carece del formulario/bootstrap que está en GitHub; no se elimina la implementación canónica.

MAIN 8d4fda70ea65a3eb208352c272dc681059d88fdf; PR5 70c3d30e00c73de3f2e6398bb011d1513520326d; PR6 inicial 9f46cac050ca38112a5016b742cd9be592fe88f5. Sin merge ni modificaciones de producción.

## Criterios

CI, reconciliación final, scheduler, envíos, seguridad viva, E2E y documentación final aún no acreditados sobre un RC. No alterar evidencia histórica. La publicación y los resultados finales se agregarán en una actualización posterior de este expediente.

Health directo con acceso de servicio vigente de Sites: HTTP 200, service salvacion-m. Esto no acredita que el secreto guardado en GitHub sea válido. CRM v11 setup-status devolvió HTTP 401 porque su fuente desplegada no contiene esa ruta.

## Hallazgos vivos posteriores al primer despliegue

Gates v18 y CRM v12 publicados sobre candidato 52f6ae19bb61b6c1c42178460feea68aba88a7e4. CI general 38266447854 SUCCESS y QA 38266447587 SUCCESS. 43 archivos canónicos coinciden con los commits Sites; los Workers coinciden con los archives.

Navegador CRM v12: SyntaxError Identifier '$' has already been declared en crm.js; scripts clásicos compartían ámbito. Se corrige mediante módulos Web estándar. El cliente auth reemplazaba headers por el spread de options; se corrige para conservar Content-Type y CSRF. Health Gates HTTP 200; setup-status CRM HTTP 401 No autorizado. CRM_AUTH_SERVICE_TOKEN se reconcilia entre ambos QA y BACKEND_SITE_AUTH_TOKEN contra acceso vigente de Gates mediante secretos de Sites, sin exponer valores. Revisión Gates 20 y CRM 9; otras variables preservadas. Nuevo RC y despliegues requeridos.

## Bloqueante criptográfico detectado y corrección

RC c2bf687932e9034248d0ca0bf0225fae835eeb49: CI general 38267255548 y QA 38267255556 SUCCESS. Gates v19 (cb51f1d829e7b9c8190709e9835d8e1f68ffd897), CRM v13 (efa25ede696c1f4078ba2827d708b0a1fe09691e) publicados. Auth service: setup-status 200 needs_setup true; diagnostics 200 DB bound, user_count 0. Navegador muestra Crear acceso ADMIN y no nueva colisión $. Crypto-self-test vivo devuelve 503 PBKDF2_UNAVAILABLE a 210000: la derivación nativa del Worker no admite la operación. No se atribuye una causa más específica sin logs del motor.

Se añade fallback PBKDF2-HMAC-SHA-256 JavaScript conforme a RFC 8018, con 210000 evaluaciones encadenadas y XOR del bloque completo, 256 bits. No divide ni concatena derivaciones. Se usa solo si deriveBits nativo falla; parámetros, formato y compatibilidad se conservan. Equivalencia con Node verificada para contraseña normal, clave larga Unicode y rechazo de coste reducido. Gates 49/49 locales. Falta autoprueba viva sobre la nueva versión. Requiere otro RC y publicación.

- Control adicional: bootstrap concurrente crea exactamente un ADMIN y un registro de éxito correlacionado, mediante INSERT condicional del usuario y auditoría en el mismo batch. Prueba SQLite real local: dos solicitudes simultáneas producen 201/409, users=1 y audit=1. Gates 50/50. Este cambio genera el RC definitivo posterior.

## Estado final verificable de esta actuación

RC único: `247ccf4222a2a075820ffde9df1b6d253f2773c8`. CI general [38269252363](https://github.com/lider11/salvacion-M/actions/runs/38269252363) SUCCESS; QA release [38269252132](https://github.com/lider11/salvacion-M/actions/runs/38269252132) SUCCESS. Gates 50/50 y CRM 15/15. No merge de PR, producción intacta.

Gates v20: source `99e4954c8e749db45c43baef49d446c3f20c5fab`, deployment `appgdep_6accfac50bc08191b050717d3e3c5537`, succeeded, env revision 20.
CRM v14: source `e3fd0bb842eb3ba7fd91dca5d86926f93bea0d71`, deployment `appgdep_6accfadd55b48191a2a396fbf6da3511`, succeeded, env revision 9.

46 archivos de fuente, incluidos lockfiles y fallback criptográfico, reconciliados por SHA256 con los commits Sites. Los SHA Sites difieren del monorepo por sus repositorios independientes; contenido de componentes y Workers de archives verificado. Matriz: `g3-reconciliation-final-2026-10-12.json`. No afirmar igualdad de SHA Git entre repositorios.

### Ejecuciones vivas

- Health directo de Gates: 200, service salvacion-m.
- Crypto-self-test protegido de Gates v20: **200 ok=true PBKDF2-SHA-256 iterations=210000 derived_bits=256**. Superado fallo real v19 sin reducir coste.
- Diagnostics: 200, DB bound, user_count 0. No lectura de credenciales/tabla de sesiones.
- CRM setup-status: 200 needs_setup=true. Muestra formulario Crear acceso ADMIN.
- Se inició sesión segura GitHub como lider11 y se ejecutó realmente auth_only=true en main: [run 38269316778](https://github.com/lider11/salvacion-M/actions/runs/38269316778), SHA main 8d4fda70ea65a3eb208352c272dc681059d88fdf. Logs: AUTH_ONLY true, 2026-10-12T15:19:00.2576112Z site_auth HTTP 401, SITE_AUTH_HTTP_401. No POST ni envío. Esta prueba de conectividad no acredita el scheduler sobre RC ni 7/7.
- Evidence artifact 11756371280, digest sha256:da910bc37301eafe147ab54ddd318ee665447dd241e0d28cbf687d3ef16c4802.
- D1 appointment_reminders: 0 filas, has_more=false; no triggers reales ni entrega nueva.
- Navegador vivo v20/v14: validación de Gates sin selección muestra mensaje y enfoca radio; Space/Tab/Enter avanza paso 1→2. CRM Tab enfoca contraseña con outline solid. Ancho 1363px; sin overflow horizontal en ambas superficies observadas. Sin credenciales introducidas por el agente, sin submit de solicitud ni ADMIN.
- No se repitió error JavaScript $ después de módulos. Errores anteriores retenidos en logs se distinguen por hora; errores de extensión del navegador no se atribuyen al Site.
- Mobile y E2E autenticado completos NO EJECUTADOS. API de navegador conectada no permite cambiar viewport/emular dispositivo. Inspección CSS no se toma como prueba mobile.
- Evidencia visual: `evidence/g3-crm-v14.jpg`, `evidence/g3-gates-v20.jpg`, `evidence/g3-auth-only-38269316778.jpg`.

### Matriz de decisión

| Nº | Criterio | Estado | Evidencia RC/deployment | Riesgo residual |
|---|---|---|---|---|
| 1 | CI y RC | ACREDITADO | RC 247ccf4; dos runs SUCCESS, artifacts y contratos | CI no sustituye pruebas vivas |
| 2 | GitHub/Sites | ACREDITADO | 46 archivos; Gates v20/CRM v14; ambos archives y deployments | SHA Sites diferente por repositorios separados |
| 3 | Scheduler | FAIL REAL | auth_only main run 38269316778, HTTP 401 | Secreto requiere ajuste humano; falta run RC PASS |
| 4 | Envíos/proveedor/idempotencia | NO ACREDITADO | D1 0; local SQLite/simulación PASS | Aceptación y entrega no ejecutadas |
| 5 | Auth/RBAC/CSRF | NO ACREDITADO | PBKDF2 vivo PASS; suites locales; users 0 | Falta primer ADMIN y E2E roles/CSRF/logout/expiración; rate limit sin política |
| 6 | Visual/accesibilidad | NO ACREDITADO | Desktop/teclado parcial vivo, capturas | Falta mobile y flujo autenticado integral |
| 7 | Documentación/trazabilidad | ACREDITADO | Memoria, reporte JSON, matriz y PR actualizados | Expediente identifica explícitamente faltantes |

**G3_CRITERIA: 3/7. G3_STATUS: READY_FOR_VERIFICATION.**

La actualización final de evidencia es documental; no altera RC, Workers ni resultados anteriores. El PR6 HEAD documental posterior se informa separadamente del SHA ejecutable congelado.

La política de navegador exige intervención humana para introducir y guardar una nueva credencial. Se prepara la interfaz segura de GitHub para el secreto SITES_QA_AUTHORIZATION de qa y el formulario ADMIN de CRM; no se pide compartir secretos por chat. El cambio requiere acción humana, no aprobación de despliegue. Continuación: corregir secreto, auth_only real en main y luego en RC, crear ADMIN, confirmar cita controlada autorizada, dos triggers y entrega correlacionada, E2E roles y mobile. No cambiar PASS mientras falte evidencia.
