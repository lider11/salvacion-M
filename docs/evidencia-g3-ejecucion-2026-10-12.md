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
