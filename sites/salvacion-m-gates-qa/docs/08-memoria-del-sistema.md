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
