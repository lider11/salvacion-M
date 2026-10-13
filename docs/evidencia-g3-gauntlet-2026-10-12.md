# G3 — Gauntlet Loop acotado — 12 de octubre de 2026 (Bogotá)

UTC de la nueva prueba: 2026-10-13T01:28:26Z. No es una ejecución del 13 de octubre local.

Roles constructor, crítico y árbitro ejecutados secuencialmente por el mismo asistente. No se utilizaron agentes/modelos independientes. Fuente operativa: master prompt aportado por el usuario; sus límites controlan intentos, no inventan umbrales funcionales.

## Resultado booleano

`G3_PASS = FALSE`; `G3_STATUS = READY_FOR_VERIFICATION`; `G3_CRITERIA = 3/7`.

RC: `247ccf4222a2a075820ffde9df1b6d253f2773c8`. PR6 HEAD observado al inicio: `2f35eb1aae82daed04d7797f327340ff59754d9d`. Comparación GitHub RC→HEAD: solo 7 archivos documentales/capturas, sin modificaciones ejecutables. No se regeneró RC ni se publicaron versiones duplicadas.

Gates v20/source `99e4954c8e749db45c43baef49d446c3f20c5fab`, deployment `appgdep_6accfac50bc08191b050717d3e3c5537`.
CRM v14/source `e3fd0bb842eb3ba7fd91dca5d86926f93bea0d71`, deployment `appgdep_6accfadd55b48191a2a396fbf6da3511`.

## Fase E — único intento nuevo

Se ejecutó por interfaz GitHub `QA appointment reminders`, rama main, auth_only=true. Run [38332283708](https://github.com/lider11/salvacion-M/actions/runs/38332283708), job 115084509775, SHA `8d4fda70ea65a3eb208352c272dc681059d88fdf`.

Logs sanitizados:
- 2026-10-13T01:28:25.9580318Z AUTH_ONLY: true.
- 2026-10-13T01:28:26.8462308Z site_auth HTTP: 401.
- 2026-10-13T01:28:26.8463571Z SITE_AUTH_HTTP_401.

`SCHEDULER_AUTH_PASS = FALSE`, diagnóstico `FAIL_REAL`. No POST ni envío. No inferir validez del secreto GitHub desde el health directo. No repetir sin cambio verificable en credencial, autorización y progreso. `SHOULD_RETRY = FALSE`; `SHOULD_ESCALATE = TRUE`.

Workflow main obtenido de GitHub: blob 13de491e202615c0e67936e0b609936dbffe2ed3. auth_only y OAI-Sites-Authorization presentes. No se leyeron valores de secretos.

## Trabajo independiente completado

- Health Gates con acceso de servicio vigente propio: HTTP200, service salvacion-m. No sustituye scheduler real.
- CRM setup-status: HTTP200, needs_setup=true. El primer ADMIN sigue pendiente; no se creó una cuenta sintética permanente ni se introdujeron credenciales nuevas.
- D1 appointment_reminders: 0 filas y has_more=false. Proveedor e idempotencia real siguen no acreditados.
- CI general 38269252363/job114879124868 y QA 38269252132/job114879123640: success comprobado. No se repitieron suites inalteradas sin motivo.
- Procedencia v20/v14 verificada contra los IDs de versión guardados. Matriz de 46 archivos anterior continúa aplicando al mismo RC.
- Auditoría local adicional con SQLite real: sesión válida, expiración por inactividad, expiración absoluta, revocación, logout sin CSRF, CSRF incorrecto, logout correcto y reutilización de sesión revocada: **8/8 PASS_LOCAL_ONLY**. No accreditación viva ni sustitución de roles completos.
- El primer harness local falló por 10 placeholders frente a 9 columnas de crm_users. Se corrigió el fixture, no el producto; segunda ejecución aprobada. Se comprobó reproducción desde la ruta portable del helper. No se ocultó ni atribuyó el fallo al Worker.
- Reproducción: en raíz del repo, `npm run build --prefix sites/salvacion-m-gates-qa`, luego `node docs/gauntlet-session-audit.mjs`. Solo SQLite en memoria, sin red, D1 real ni envíos. Resultado: `g3-gauntlet-local-session-audit-2026-10-12.json`.

## Crítica adversarial

1. La prueba auth_only ejecuta main, no el SHA RC. Su fallo no se convierte en prueba de éxito sobre RC.
2. El health directo aceptado por Sites no prueba que SITES_QA_AUTHORIZATION guardado en GitHub sea válido.
3. Los recibos y checks simulados/locales no acreditan entrega ni idempotencia real.
4. La ausencia de usuario ADMIN impide login, roles, CSRF, logout y expiración E2E vivos. No se debilita bootstrap ni autenticación para pasar la prueba.
5. Falta política/implementación aprobada de rate limiting, recuperación tardía y migración 600000. No se inventan umbrales.
6. FALSE en criticalDefects significa ningún defecto crítico confirmado en esta revisión limitada, no ausencia demostrada de vulnerabilidades. security_audit_complete=false.
7. El archivo de auditoría bajo docs es un helper local nuevo: no cambia los Workers o el RC desplegado, ni se afirma que sus ocho pruebas formen parte del CI histórico.

## Matriz

| Nº | Criterio | Booleano | Diagnóstico | Evidencia | Riesgo pendiente |
|---|---|---|---|---|---|
| 1 | CI y RC | TRUE | PASS | Dos jobs success; mismo código | No reemplaza E2E vivo |
| 2 | GitHub/Sites | TRUE | PASS | v20/v14; RC→HEAD solo docs | Provenance no prueba comportamiento completo |
| 3 | Scheduler | FALSE | FAIL_REAL | run38332283708, HTTP401 | Actualización humana de secreto |
| 4 | Entrega/idempotencia | FALSE | NO_ACREDITADO | D1 0; triggers NOT_RUN | Falta correlación y entrega |
| 5 | Auth/RBAC/CSRF | FALSE | BLOCKED | Setup requerido; 8 controles locales | Falta ADMIN, roles/E2E y rate limit |
| 6 | E2E/accesibilidad | FALSE | NO_ACREDITADO | Parcial histórico mismo RC | Mobile y flujo autenticado pendientes |
| 7 | Documentación | TRUE | PASS | Bitácora, reporte, helper, captura y PR | Actualizar tras intervención humana |

Fases: E FAIL_REAL; F NO_ACREDITADO (checks locales adicionales completos); G PASS; H PASS; I NOT_RUN; J NO_ACREDITADO; K PASS documental.

## Terminación acotada

Un nuevo intento externo auth_only, cero reintentos del mismo fallo, una corrección del fixture local, cero cambios de producto y cero envíos. Máximos: 3 correcciones por defecto; 2 reintentos externos; 2 rondas adversariales por cambio. No se necesitó agotarlos: la falta de progreso/credenciales determina detención anticipada.

`SHOULD_FINISH = TRUE` para esta actuación después de guardar la documentación. Terminar no equivale a aprobar G3.

Bloqueos humanos: actualizar SITES_QA_AUTHORIZATION en GitHub qa por interfaz segura y crear primer ADMIN en CRM. La política de navegador exige entrada y guardado humanos de una credencial nueva. No pedir secretos por chat. Después: un health real; auth_only sobre RC; cita controlada autorizada; dos triggers seguros; entrega correlacionada; roles/CSRF/logout y mobile.

Archivos: `g3-gauntlet-report-2026-10-12.json`, `g3-gauntlet-iterations-2026-10-12.json`, `g3-gauntlet-local-session-audit-2026-10-12.json`, `gauntlet-session-audit.mjs` y captura `evidence/g3-gauntlet-auth-only-38332283708.jpg`.
