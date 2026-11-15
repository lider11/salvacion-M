# H01 — Reconciliación arquitectónica

Fecha: 2026-11-15 (America/Bogota). Orden: SM-H01-ARQUITECTURA-2026-002 v2.0.
Base verificada de `main`: `3d6e7833040583851d23531050599fa932573675`.
Rama de corrección: `fix/h01-hostinger-architecture-20261115`.

**Estado: RESUELTO en la rama de corrección; integración en `main` pendiente.** Cierre del hallazgo documental y de las contradicciones técnicas aquí descritas, no declaración de operación ni cumplimiento integral. No se modifica producción, Sites ni bases existentes.

## Diagnóstico y correcciones

| Contradicción inicial | Resultado |
| --- | --- |
| README daba Express por consolidado; PRODUCT y ADN mantenían Node/Express y persistencia indecisa | PHP 8.2+/PDO/MySQL compatible, SQLite solo local; previsión anterior anotada como sustituida |
| G3 retirado en README/AGENTS pero informes anteriores podían parecer vigentes | Anotaciones de vigencia en informes; historial, resultados y ramas preservados |
| Arquitectura decía formulario «cuando exista»; la guía describía checkbox deshabilitado | Vista previa existente, casilla de lectura funcional sin consentimiento ni envío |
| API podía recibir con configuración válida aunque frontend estuviera cerrado | `accept_requests` exige booleano `true`; cerrado por defecto, sin escritura si está desactivado |
| Configuración de ejemplo podía superar validaciones | Rechazo de marcadores `CAMBIAR_*`; versión de privacidad limitada a 80 bytes conforme al campo MySQL |
| Rutas mal instaladas podían producir error sin respuesta JSON | Bootstrap ausente: JSON 503 sin rutas; prueba con backend y configuración fuera del webroot |
| Ruta real de configuración podía quedar en caché tras cambiar un enlace simbólico | Caché de rutas limpiada antes de comprobar ubicación privada; regresión comprobada |
| Campo trampa recibido como objeto causaba error PHP | Rechazo JSON 400, con prueba de regresión |
| Mensajes de un manejador alternativo inactivo llamaban autorización a la lectura | Terminología alineada; la vista previa activa ya diferenciaba ambos conceptos |
| Guía omitía `mbstring` y no delimitaba protecciones pendientes | Dependencias, permisos, HTTPS, alcance de `.htaccess`, CSRF y limitación de abuso documentados |

## Inventario y arquitectura consolidada

La base contiene 117 archivos versionados. Las carpetas de herramientas de diseño y sus recursos no son dependencias de ejecución del portal.

| Componente / rutas | Responsabilidad y estado |
| --- | --- |
| `index.html`, `privacidad.html`, `css/`, `js/`, `assets/` | HTML5/CSS3/JS Vanilla, formulario de revisión local. Sin `fetch` de solicitudes ni recepción habilitada. PNG actual; SVG histórico conservado |
| `api/requests.php` | API JSON inicial; valida, limita por correo HMAC y persiste solicitud y consentimiento; recepción desactivada por defecto |
| `backend/bootstrap.php`, `backend/config.example.php` | Configuración privada, PDO, respuestas e identificadores; no secretos reales |
| `backend/migrate.php`, `backend/migrations/` | Migrador solo CLI; dos esquemas, MySQL InnoDB/utf8mb4 y SQLite local |
| `tests/php-api-smoke.php` | Pruebas HTTP con SQLite y estructura de alojamiento temporal aislada |
| `tests/frontend-preview.cjs` | Ensayo preparado de revisión local, teclado, 5 tamaños y no envío. Requiere Playwright/Chromium como herramientas de desarrollo; ejecución pendiente |
| `docs/`, README, AGENTS, PRODUCT, DESIGN | Decisiones, alcance, diseño e historial; sin puertas globales G3/SDD |
| `.github/skills/`, `.impeccable/`, `output/playwright/` | Herramientas/evidencia histórica de diseño; no desplegar |
| CRM nuevo | Aplicación administrativa independiente pendiente; sin login, roles, panel ni auditoría operativa implementados |
| Citas, notificaciones y scheduler nuevos | No implementados en esta línea. GitHub no es scheduler |
| Hostinger | Alojamiento previsto; plan, dominio, HTTPS, PHP, MySQL, permisos y rutas reales no inspeccionados |
| Sites QA y D1 históricos | Sistemas separados, no inspeccionados ni modificados; sin sincronización ni migración de datos |

No hay `package.json`, `composer.json` ni workflows de CI en la base `main` examinada. No se introducen dependencias de aplicación ni frameworks. PHP requiere PDO/mbstring y el driver correspondiente. Revisión de historial: `reinicio-2026-desde-cero` (`1e331b0`) conserva Node/Express como antecedente; `auth-v2-vanilla-js` (`5e55b82`) conserva el trabajo Sites/G3; `trabajo-proceso-001` (`4e1775d`) conserva rediseños. No se fusionan ni eliminan esas ramas. Los PR históricos #5 y #6 siguen abiertos y se conservan sin cambios; no forman parte de esta corrección.

## Pruebas ejecutadas y límites

| Comprobación | Resultado de esta ejecución |
| --- | --- |
| PHP 8.4.27 CLI, PDO SQLite/MySQL y mbstring disponibles localmente | Comprobados; runtime temporal de paquetes Debian, no representa Hostinger |
| `php -l` en API, bootstrap, ejemplo, migrador y smoke | 5/5 archivos sin errores |
| `php tests/php-api-smoke.php` | 37/37 comprobaciones aprobadas con HTTP y SQLite reales, datos sintéticos y limpieza final |
| `node --check js/main.js`, `js/social.js`, `tests/frontend-preview.cjs` | Sin errores, Node 24.22.1 |
| Recursos y anclas HTML locales | 56 referencias verificadas, sin faltantes ni IDs duplicados |
| Vista previa y botón de envío | Marcado conservado: `data-preview-only="true"`, submit oculto/deshabilitado; comprobación estática |
| Diff | Sin errores de espacios/conflictos en archivos modificados |
| Navegador, responsive, teclado, WCAG | NO EJECUTADOS: Playwright 1.62.1 no tenía navegador empaquetado; Chromium del sistema falló con `socket() failed: Operation not permitted` antes de abrir una página |
| MySQL real, permisos, `.htaccess`, HTTPS, alojamiento | PENDIENTES: no conexión de hosting disponible; el conector encontrado solo gestiona Hostinger Mail |

Las 37 comprobaciones cubren migración SQLite repetible, rutas privadas, JSON, método/origen/fetch-site, tamaño, activación explícita, consentimiento versionado, datos de ejemplo, entrada malformada, respuesta tras persistencia, cabeceras, límite de abuso, texto SQL/HTML inerte, rollback y bootstrap ausente. Guardar HTML como texto no acredita escape del futuro CRM.

La primera ejecución detectó caché de ruta real durante una sustitución por symlink. Se corrigió y se repitió la suite completa: 37 aprobadas. No se reutilizan resultados históricos como pruebas actuales. La migración MySQL fue revisada, no ejecutada; SQLite no demuestra funcionamiento MySQL.

Para reproducir: PHP 8.2+ con `mbstring`/`pdo_sqlite`, ejecutar `php tests/php-api-smoke.php`. Para navegador, servir localmente el portal y ejecutar `BASE_URL=http://127.0.0.1:8765 node tests/frontend-preview.cjs` con Playwright instalado como herramienta de desarrollo; `CHROMIUM_PATH` permite indicar un Chromium existente. Este ensayo no acredita WCAG integral.

## Pendientes y riesgos independientes de H01

1. Aprobar aviso, responsable legal, canales de derechos, minimización, finalidad y retención; resolver teléfono opcional frente a finalidad de llamada. No recibir datos reales antes de completar estos puntos.
2. Inspeccionar y preparar staging con carpeta y base propias; verificar PHP/extensiones, MySQL, privilegios, rutas privadas, HTTPS, cabeceras y respaldos. No cambiar PHP global si afecta producción.
3. Ejecutar smoke MySQL y pruebas en navegador/staging. El servidor PHP local no interpreta `.htaccess`.
4. Resolver protección de volumen y retención. El límite por correo no impide abuso rotando direcciones. La API inicial no promete idempotencia.
5. Implementar el CRM separado con autenticación, RBAC, CSRF, salida escapada y auditoría. Conectar el formulario solo después de autorización y verificación; éxito únicamente tras persistencia.
6. Revisar e integrar esta rama en `main`; no se realiza merge estratégico ni despliegue automático.

**Estados:** correcciones IMPLEMENTADAS y API PROBADA LOCALMENTE. DESPLIEGUE y OPERACIÓN en Hostinger NO ACREDITADOS. G3/SDD no se reinstalan y su historial no se altera.

## Trazabilidad de los archivos probados

SHA-256 del contenido; el SHA Git de implementación se registra en la memoria canónica y en el historial de esta rama. Un commit posterior de memoria no cambia estos archivos.

| Archivo | SHA-256 |
| --- | --- |
| `api/requests.php` | `8e14d445488cb765e282fe894935fe5574d4904e11a99562143a5f6339940077` |
| `backend/bootstrap.php` | `4798e4e18db93c2c49c6e29a194e98fee7a09830df668a38b85bae0899e9f00e` |
| `backend/config.example.php` | `157a1af244ed16c6d0c3d52b381ed49295600860e8f238079c86e9376af1e158` |
| `backend/migrations/mysql.sql` | `b12bbfc3039ffc0f264dbda80dc8259fabafddef39d942d5a93f9b1f8702e2fa` |
| `backend/migrations/sqlite.sql` | `06c19bbd12013ac071a1b8bc35b167068ac63f0c51a15706e42b17b1e6da45be` |
| `tests/php-api-smoke.php` | `52fb9212ed5394ea241fae54157c5d087ff399c713bcc8433a48ce26230a949c` |
| `js/main.js` | `cb37585bab4f2b3c6b6945ccfa2762ce94f8a3c439273d83f92a6660e2825ee2` |
| `js/social.js` | `ffe9c00663c3da1f35f161170d5b2a6e4eac6f8ec37c3e959971dca4d7ee179c` |
| `index.html` | `85c0abb247ad792070e277c900c8f9f8b79f4a7a3bd25a60d59a4ee91d0703f1` |

## Archivos afectados

- Gobernanza/producto: `AGENTS.md`, `README.md`, `PRODUCT.md`.
- Arquitectura/operación: `docs/arquitectura-inicial.md`, `docs/backend-hostinger.md`, `docs/ADN-MAESTRO-V2.md`.
- Historia/vigencia: `docs/IDENTIDAD-GRAFICA-LOGO.md`, `docs/SM-FRONT-CONTACTO-001.md`, `docs/SM-FRONT-NOSOTROS-003.md`, `docs/SM-FRONT-PROCESO-001.md`, `docs/SM-FRONT-SERVICIOS-003.md`.
- Implementación: `api/requests.php`, `backend/bootstrap.php`, `backend/config.example.php`, `js/main.js`.
- Pruebas: `tests/php-api-smoke.php`, `tests/frontend-preview.cjs`.
- Trazabilidad: `docs/08-memoria-del-sistema.md`, `docs/H01-reconciliacion.md`.

Las migraciones, HTML, CSS y datos existentes no se modifican.
