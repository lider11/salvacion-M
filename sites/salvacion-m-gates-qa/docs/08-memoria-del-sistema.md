# Memoria de despliegue QA — 27 de septiembre de 2026

Integración del PR #5 de lider11/salvacion-M, SHA fuente c1a7b99d5755d51bd97a74559264f26a71882344, sobre el código QA 34719b3a10bfcc2f09c78a2c6d8ba8c31d63bca9.

- Incorporados endpoint POST /api/internal/reminders/dispatch y pruebas versionadas.
- Conservado proveedor Brevo de QA como alternativa cuando no existe REMINDER_WEBHOOK_URL; conservada ruta protegida de prueba del proveedor.
- Autenticación mediante REMINDER_TRIGGER_TOKEN existente, sin copiar secretos al código.
- Migraciones y manifiesto D1 sin cambios; CRM, dominio, acceso y variables sin modificaciones.
- Build y validación del Worker/manifiesto aprobados; 30 pruebas aprobadas, ninguna fallida. Incluye doble trigger HTTP con proveedor simulado y un solo registro lógico.
- No se crea scheduler ni se ejecutan envíos reales. G3 permanece READY_FOR_VERIFICATION; las pruebas locales no acreditan entrega real.
- El SHA de Sites difiere del SHA GitHub porque conserva configuración y adaptador Brevo específicos de QA.

## 28 de septiembre de 2026 — monitor y auditoría de recordatorios G3

- Implementado GET /api/admin/reminders de solo lectura, protegido por los roles existentes. Resumen, ventana +23/+25 horas, historial y auditoría sin datos de contacto ni secretos.
- dispatchReminders genera run_id, conserva evidencia de inicio, aceptación/error y duplicado evitado en activities. Se captura messageId y estado HTTP del proveedor. La aceptación no equivale a entrega.
- Estado del recordatorio y recibo se persisten en una transacción. Se conserva la reserva única para impedir reenvíos automáticos después de un fallo de persistencia o proveedor.
- Integración con la pestaña Recordatorios del CRM QA separado: HTML semántico, JavaScript sin dependencias y CSS responsive de la marca.
- No cambian esquema, migraciones, datos existentes ni variables. No se ejecutan envíos reales ni se crea scheduler nativo.
- Validación: build y validate aprobados; 32 pruebas backend y 8 CRM aprobadas. Incluyen doble trigger con proveedor simulado, recibo, permisos, fallo y no reenvío.
- Limitación: no hay preview de navegador compatible para estos Workers; no se acredita auditoría visual en navegador ni ejecución del scheduler real en esta actuación.
- G3 = READY_FOR_VERIFICATION. Pendientes: resolver/verificar autenticación del scheduler privado, cita sintética en ventana, dos disparos reales y evidencia de entrega del proveedor.

## 28 de septiembre de 2026 — flujo interactivo de verificación G3

- HTML semántico, CSS responsive y JavaScript sin dependencias: pestaña Flujo G3 con selección de cita, ocho pasos navegables, condiciones sí/no, progreso y acción correctiva.
- Endpoint GET/POST /api/admin/g3/verification: cálculo de requisitos en servidor y evidencia documental append-only en activities, sin cambios de esquema o migraciones.
- Roles: consulta para lectores; escritura solo para administrador identificado. No se acepta administración heredada para evidencias. Proxy exige Origin coincidente para POST.
- Registro documental incluye URL HTTPS sin credenciales/parámetros/fragmentos, identidad y fecha; no se consultan URLs del usuario desde el servidor. No se almacenan secretos ni datos clínicos.
- Control optimista de concurrencia y request_id idempotente para reintentos. Validación en servidor, límites de entrada y render mediante textContent.
- Primer/segundo disparo y messageId se contrastan con D1. Evidencias del scheduler, destinatario, entrega, interfaz y reconciliación se identifican explícitamente como revisiones humanas.
- Una decisión de revisión solo se registra cuando los siete criterios tienen soporte. No cambia el gate canónico de GitHub: estados READY_FOR_VERIFICATION → READY_FOR_REVIEW → REVIEW_RECORDED. Cualquier nueva evidencia invalida la revisión anterior; los SHA de revisión visual y documentación deben coincidir.
- Exportación JSON del expediente; no se usa localStorage como fuente de verdad. Las credenciales y el envío siguen en servidor/scheduler; el frontend no dispara recordatorios.
- Validación: build y validate PASS en ambos proyectos; 33 pruebas backend y 9 CRM aprobadas. Casos de permisos, CSRF, reintento, conflicto, URLs inválidas, cierre prematuro, correlación y revisión invalidada. Envíos simulados, sin comunicación real.
- Referencias consultadas el 28-09-2026: WCAG 2.2 (https://www.w3.org/TR/WCAG22/) y OWASP ASVS 5.0.0 (https://owasp.org/www-project-application-security-verification-standard/). Se aplican controles concretos; no se declara certificación WCAG/ASVS integral.
- Pendiente: revisión visual real en navegador (Workers sin preview compatible), ejecución del scheduler y evidencia real de entrega. G3 conserva READY_FOR_VERIFICATION.
