# Arquitectura — Salvación M

Documento corto y vigente. Define el backend PHP inicial para alojamiento compartido Hostinger.

## Superficies

1. **Portal público** — información y formulario de revisión local, sin recepción de datos (HTML/CSS/JS).
2. **API** — PHP 8.2+ y PDO; validación, persistencia MySQL y límites básicos de abuso.
3. **CRM futuro** — aplicación administrativa independiente pendiente de implementación; requerirá autenticación, roles, protección CSRF y auditoría.
4. **Citas / recordatorios** — pendientes; elegir mecanismo compatible con el plan de hosting, con registro e idempotencia. No GitHub Actions.
5. **Base de datos** — MySQL compatible en Hostinger (versión real pendiente); SQLite solo para desarrollo y pruebas locales.

## Orden práctico

1. Completar y estabilizar el portal público.
2. Conectar el formulario a la API cuando el aviso de privacidad esté aprobado; éxito solo tras guardar.
3. CRM mínimo para revisar solicitudes.
4. Citas y recordatorios si hacen falta.
5. Pruebas de lo construido (incluyendo accesibilidad en flujos reales).

## Límites actuales

- Hay landing local y una API PHP inicial en `api/requests.php`; la conexión y configuración MySQL de Hostinger no están verificadas.
- El formulario frontend continúa en modo de vista previa y no envía datos a la API.
- Este documento no acredita despliegue ni operación.
- Producción no se modifica sin autorización expresa.

## Contrato y separación

`POST /api/requests.php` recibe JSON únicamente cuando `accept_requests` sea el booleano `true` en configuración privada. Valida origen y campos, limita por HMAC de correo y persiste solicitud y consentimiento en transacción PDO. Devuelve un ID después del commit; no crea citas ni envía mensajes. El endpoint histórico `/api/v1/requests` no existe en esta línea. La casilla de vista previa solo acredita lectura del borrador y no se serializa como consentimiento.

Hostinger es el alojamiento previsto, pendiente de comprobación real. `backend/` y `private/` deben quedar fuera del directorio público; `public_html/api/requests.php` es la entrada pública. Guía de rutas, extensiones y permisos: [backend-hostinger.md](backend-hostinger.md).

Sites/D1 y los QA `salvacion-m-gates-qa` / `salvacion-m-crm-qa` son antecedentes o sistemas separados: no se han inspeccionado ni modificado, no se sincronizan y no se migran sus datos. G3 y SDD extenso están retirados de los procedimientos vigentes; se preservan documentos y resultados históricos. Se mantienen seguridad, privacidad y objetivo WCAG 2.2 AA con pruebas proporcionales a cada cambio.
