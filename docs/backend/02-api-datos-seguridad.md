# Salvación M — Contratos REST, datos y seguridad
Fecha: 2026-11-08 | Estado: PROPUESTA SUJETA A INVENTARIO

## Endpoints preliminares
| Método | Ruta | Objetivo | Acceso |
|---|---|---|---|
| POST | /api/v1/requests | Crear solicitud y retornar ID persistido | Público, validado y limitado |
| GET | /api/v1/requests | Listar con filtros y paginación | CRM autorizado |
| GET | /api/v1/requests/:id | Consultar solicitud | CRM autorizado por registro |
| PATCH | /api/v1/requests/:id | Actualizar estado | CRM con rol permitido |
| POST | /api/v1/auth/login | Iniciar sesión | Público, con protección contra abuso |
| POST | /api/v1/auth/logout | Invalidar sesión | Autenticado + CSRF |
| GET | /api/v1/auth/me | Identidad y permisos | Autenticado |
| POST | /api/v1/appointments | Registrar cita | CRM con permisos |
| PATCH | /api/v1/appointments/:id | Reprogramar/cancelar cita | CRM con permisos |
| GET | /api/v1/health | Estado mínimo sin datos sensibles | Infraestructura |
| POST | /api/internal/reminders/dispatch | Despacho interno controlado | Servicio autenticado, no público |

Los nombres son propuestas, no rutas implementadas. Definir contratos de request/response, errores y políticas de versión antes de programar.

## Respuesta y errores
Crear solicitud: HTTP 201 únicamente cuando la transacción sea confirmada; cuerpo con `id`, `status` y `requestId`. Validación inválida: 400/422 sin datos internos. Sin sesión: 401; sin permiso: 403; recurso inexistente: 404; conflicto de versión: 409; error interno: 500 con ID de correlación. No filtrar stack traces, SQL ni datos médicos.

## Modelo de datos conceptual
`users`, `sessions`, `clients`, `requests`, `appointments`, `appointment_reminders`, `notification_attempts`, `audit_logs`, `scheduler_runs`. Verificar claves foráneas, unicidad, índices, timestamps UTC, estados, retención y controles de acceso. La estructura definitiva debe derivarse de los datos actuales y de la selección de motor.

## Seguridad mínima
- HTTPS; cookies de sesión HttpOnly, Secure y SameSite apropiado; rotación y revocación de sesiones.
- Autenticación, RBAC y autorización por objeto/registro contra IDOR.
- Protección CSRF para acciones con cookies de sesión; CORS restrictivo, no comodín con credenciales.
- Validación de entrada, límites de tamaño, escaping contextual en el frontend, CSP razonable y consultas SQL parametrizadas.
- Hash de contraseña con esquema robusto. Si se conserva PBKDF2-SHA-256, mantener al menos 210.000 iteraciones, sal única y migración de hash controlada.
- Gestión de secretos exclusivamente fuera del repositorio (variables de entorno o gestor del proveedor); prohibido escribir contraseñas, tokens y claves HMAC en Git.
- Límites de intentos de login y peticiones públicas, con protección frente a abuso.
- Auditoría de altas, accesos, cambios de estado, autenticación, cambios de permisos, citas y envíos; logs sin contenido de salud salvo justificación específica.
- Datos sensibles de salud: minimizar recolección, aplicar privacidad desde el diseño, políticas de retención y acceso restringido conforme a Ley 1581 de 2012 y reglamentación aplicable; revisión jurídica previa a producción.
- Accesibilidad del frontend: WCAG 2.2 AA, pruebas de teclado, móvil y lectores de pantalla.

## Migración desde D1, si hay datos aplicables
1. Inventario de esquema y migraciones; identificar datos y relaciones.
2. Elegir motor y proveedor de hosting; definir RPO/RTO y backups.
3. Crear migraciones reproducibles y prueba en QA con datos sintéticos o anonimizados.
4. Validar conteos, sumas de control, restricciones e integridad, incluido rollback probado.
5. Ejecutar corte solo con autorización específica, respaldo y plan de reversión.
No realizar exportaciones ni movimientos de datos reales durante la documentación.
