# Arquitectura — Salvación M

Documento corto y vigente. Define el backend PHP inicial para alojamiento compartido Hostinger.

## Superficies

1. **Portal público** — información y, cuando exista, formulario accesible (HTML/CSS/JS).
2. **API** — PHP 8.2+ y PDO; validación, persistencia MySQL y límites básicos de abuso.
3. **CRM** — interfaz separada, autenticación, roles y auditoría.
4. **Citas / recordatorios** — pendientes; elegir mecanismo compatible con el plan de hosting, con registro e idempotencia. No GitHub Actions.
5. **Base de datos** — MySQL 8+ en Hostinger; SQLite solo para desarrollo y pruebas locales.

## Orden práctico

1. Completar y estabilizar el portal público.
2. Conectar el formulario a la API cuando el aviso de privacidad esté aprobado; éxito solo tras guardar.
3. CRM mínimo para revisar solicitudes.
4. Citas y recordatorios si hacen falta.
5. Pruebas de lo construido (incluyendo accesibilidad en flujos reales).

## Límites actuales

- Hay landing local y una API PHP inicial en `api/requests.php`; MySQL de Hostinger aún no está configurado.
- El formulario frontend continúa en modo de vista previa y no envía datos a la API.
- Este documento no acredita despliegue ni operación.
- Producción no se modifica sin autorización expresa.
