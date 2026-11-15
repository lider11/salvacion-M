# Verificación del formulario local e integración PHP/MySQL

Fecha: 2026-11-15. Base inspeccionada: `9f6b345a79e0f9a46e7d3ba6283cb154f132919e`.

## Dictamen

**Funcionamiento local acreditado con datos sintéticos.** Chromium envió el formulario, la API confirmó HTTP 201 y el ID devuelto coincidió con una fila SQLite real. El mismo endpoint también pasó pruebas HTTP con MySQL 8.0.46 en una instancia temporal aislada y un usuario sin permisos DDL.

Hostinger y producción: **NO VERIFICADOS, sin cambios**. El HTML público permanece en vista previa. No se acredita operación pública, aprobación del aviso, notificaciones ni cumplimiento integral WCAG.

SHA de entrega: el commit que incorpora este informe, comunicado en el cierre. Consultable con `git log -1 --format=%H -- docs/informe-verificacion-formulario-local.md` después del commit.

## Gauntlet 2026 solicitado

Aplicado como tres fases secuenciales en esta sesión, no como auditoría independiente ni reactivación del gate global G3 retirado.

### Constructor

Se conservaron los cambios previos, se consolidó el controlador del formulario y se completó el entorno local PHP/SQLite: launcher, router con lista de rutas permitidas y consulta de registros por CLI. La confirmación requiere 201, ok true y UUID válido; se bloquean controles durante el envío para evitar doble clic y pérdida de ediciones. No se hacen reintentos automáticos.

### Crítico adversarial

| Defecto detectado | Corrección y evidencia |
| --- | --- |
| Dos controladores sin envío efectivo | Un controlador, POST JSON y correspondencia ID/fila probada en Chromium |
| Transacción DDL incompatible con MySQL | Transacción solo para migración SQLite; migración MySQL ejecutada dos veces sin error |
| Objetos/arrays JSON convertidos o descartados | Rechazo explícito de tipos incorrectos con JSON 422, incluidos opcionales y honeypot |
| Lectura de cuerpo sin cota | Lectura máxima de 16 KiB + 1 byte y rechazo 413 |
| Bootstrap ausente podía romper el contrato JSON | Respuesta controlada 503, probada por HTTP en proceso aislado |
| XAMPP imprimía un aviso de inicio y respondía 200 ante cuerpo excesivo | Arranque local y pruebas con display_errors y display_startup_errors desactivados; ahora devuelve 413 |
| Campos editables durante solicitud podían perder cambios al reset | Controles bloqueados y restaurados al finalizar; dos comprobaciones de navegador |

MySQL puede confirmar DDL implícitamente; por ello no se promete rollback de CREATE TABLE. Referencia: [manual PDO](https://www.php.net/manual/en/pdo.begintransaction.php).

### Árbitro

Los defectos corregidos pasan las pruebas pertinentes. El alcance aceptado es el formulario local y el endpoint PHP probado sobre SQLite y MySQL; no se extiende el dictamen a Hostinger. La evidencia distingue tráfico real, persistencia real y respuestas simuladas del navegador.

## Pruebas ejecutadas

Entorno: Windows, PHP XAMPP 8.2.12, PDO SQLite, PDO MySQL, MySQL 8.0.46 y Chromium instalado mediante Playwright.

| Prueba | Resultado | Evidencia |
| --- | --- | --- |
| `php tests/php-api-smoke.php` | 52 comprobaciones aprobadas con SQLite temporal | `output/qa-formulario-local/sqlite.txt` |
| `php tests/mysql-local-smoke.php` | 55 comprobaciones HTTP aprobadas; arranque aislado y dos migraciones adicionales correctos | `output/qa-formulario-local/mysql.txt` |
| `node tests/local-form-smoke.cjs` | 28 comprobaciones aprobadas | `output/qa-formulario-local/navegador.txt` |
| PHP lint en api/, backend/ y tests/ | Correcto en los nueve archivos PHP | Ejecución local en consola |
| `node --check js/main.js` y revisión del diff | Correcto | Ejecución local en consola |

Cobertura HTTP: métodos, origen ausente/ajeno, Sec-Fetch-Site, tipo de contenido, JSON malformado, límites de tamaño y campos, tipos inesperados, consentimiento/versionado, guardado, SQL como dato, HMAC, límite por correo, configuración/bootstrap ausentes y ausencia de payload/claves en logs. En MySQL: credenciales incorrectas, usuario runtime sin CREATE y fallo transaccional mediante trigger con rollback de solicitud y contador.

Cobertura navegador: un solo POST real y consulta de su fila SQLite, campos bloqueados durante envío, error transaccional SQLite real, respuestas 422/429/503/201 sin ID simuladas, interrupción de red simulada, rutas internas bloqueadas, preview sin POST, cero errores JS y sin overflow a 320/375/768/1440 px. Capturas revisadas: `output/playwright/local-form/guardado.png` y `formulario.png`.

Prueba de persistencia de navegador:

```text
HTTP: 201
ID devuelto:  de384a87-783f-4349-b350-950bbb2f80b2
ID guardado:  de384a87-783f-4349-b350-950bbb2f80b2
Versión:      local-ficticio-v1
```

Registro mínimo sin datos de contacto: `output/playwright/local-form/persistencia.json`. Las suites de API verifican además IDs y consentimiento contra filas de sus bases efímeras.

## Archivos de la entrega

- Frontend: `js/main.js`.
- API y migración: `api/requests.php`, `backend/migrate.php`.
- Entorno local: `iniciar-local.ps1`, `backend/serve-local.php`, `backend/local-router.php`, `backend/local-requests.php`.
- Pruebas: `tests/php-api-smoke.php`, `tests/mysql-local-smoke.php`, `tests/local-form-smoke.cjs`.
- Documentación: `README.md`, `docs/08-memoria-del-sistema.md`, `docs/backend-hostinger.md`, `docs/pruebas-locales.md`, `docs/sprint-envio-formulario.md` y este informe.
- Evidencias sintéticas: `output/qa-formulario-local/` y `output/playwright/local-form/`.

No se incorporan credenciales, configuración privada ni bases de datos al repositorio. La instancia MySQL de prueba crea sus propios archivos fuera del proyecto y los elimina al terminar; no usa las bases existentes del equipo.

## Pendientes y límites

1. Hostinger: verificar PHP/extensiones, HTTPS, rutas privadas, permisos MySQL, origen exacto y configuración real. Mantener display_errors y display_startup_errors desactivados y log_errors activado desde hPanel; los avisos de inicio no se corrigen desde el endpoint.
2. Producción: aún falta el mecanismo de activación pública con la versión aprobada. No basta subir estos archivos ni retirar disabled.
3. Privacidad: completar identificación legal, canal de derechos, conservación/eliminación y aviso antes de aceptar datos reales. Teléfono sigue opcional pese a la finalidad de llamadas.
4. Reintentos: no hay idempotencia entre envíos separados. Si se pierde una respuesta tras el commit, revisar registros antes de repetir.
5. Seguridad/operación: el límite por correo no sustituye controles de abuso del alojamiento. No existe CRM, RBAC de operador, auditoría administrativa ni notificaciones; no se publica una interfaz de lectura de solicitudes.
6. SQLite local reside en temporales y Windows puede limpiarlo. Es un entorno de pruebas sintéticas, sin garantía de durabilidad para operación real.

Para probar: ejecutar `.\iniciar-local.ps1` y abrir http://127.0.0.1:8088/#contacto. Ver registros con `php backend/local-requests.php`.
