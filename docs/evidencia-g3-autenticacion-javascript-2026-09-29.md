# Autenticación del scheduler en JavaScript

Implementado en main 8d4fda70ea65a3eb208352c272dc681059d88fdf y reconciliado en rama codex/g4-qa-gate. Workflow .github/workflows/qa-appointment-reminders.yml.

Cliente nativo Node.js con secretos del entorno qa, normalización de un prefijo Bearer, rechazo de controles y formato inválido, destino HTTPS fijo, redirecciones prohibidas, timeout de 30 segundos, comprobación de servicio y JSON, errores por etapa y evidencia filtrada sin tokens. No reintenta POST automáticamente. Modo manual auth_only verifica acceso sin enviar. Cron conserva su comportamiento existente.

Pruebas locales: validación de token; 401 impide POST; auth_only realiza solo GET; separación de tokens; envío exitoso simulado; error de red sin reintento ni filtración de secretos. YAML parseado correctamente. Prueba reproducible: node scripts/qa-auth-client.test.mjs (rama del PR).

## Resultado real

https://github.com/lider11/salvacion-M/actions/runs/36520298739

Job 109251464230. AUTH_ONLY=true. A las 2026-09-29T04:08:54Z (28 de septiembre 23:08:54 Colombia), site_auth HTTP 401, SITE_AUTH_HTTP_401. Artefacto 11012421435. El cliente ejecutó correctamente y Sites rechazó el token después de normalizar su formato. Esto no acredita autenticación exitosa ni identifica por sí solo si el token es incorrecto, obsoleto o de otro proyecto. No hubo POST ni envío de correo.

G3 sigue pendiente. Reemplazar SITES_QA_AUTHORIZATION en environment qa por el token vigente del backend salvacion-m-gates-qa mediante el flujo autorizado de credenciales; volver a ejecutar auth_only; preparar cita sintética confirmada en ventana y verificar dos disparos, un solo envío y entrega. El formulario de GitHub mostró que el secreto había sido actualizado el 28/09 a las 23:02 Colombia; esa actualización no resolvió el 401 observado.

Referencias oficiales consultadas: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets y https://nodejs.org/download/release/latest-v24.x/docs/api/globals.html .
