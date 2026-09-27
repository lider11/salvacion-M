# Evidencia G3 — reminders y scheduler externo — 2026-09-27

Fecha: 2026-09-27  
Gate: G3  
Estado: READY_FOR_VERIFICATION

## Objetivo

Cerrar la brecha operativa de REMINDERS sin confundir implementación con ejecución real.

## Arquitectura aprobada

scheduler externo autorizado → POST /api/internal/reminders/dispatch → dispatchReminders → D1 appointment_reminders → REMINDER_WEBHOOK_URL/proveedor.

La programación nativa de Sites se conserva como impedimento histórico y no se vuelve a exigir.

## Inspección realizada

- PR #5 abierto, rama `codex/g4-qa-gate`.
- Evidencia previa vigente de CRM/agenda, vínculo consulta→cita, disponibilidad, D1, identidad individual, Brevo y WhatsApp Cloud API.
- `dispatchReminders` selecciona citas confirmadas entre +23 h y +25 h.
- D1 impone `UNIQUE (appointment_id, reminder_type)`.
- La prueba automatizada existente demuestra en entorno simulado 2 llamadas a `scheduled` y 1 entrega lógica.
- Antes de esta actuación no existía endpoint HTTP protegido para un scheduler externo.

## Cambio versionado

Se añadió `POST /api/internal/reminders/dispatch`, protegido por `REMINDER_TRIGGER_TOKEN`, separado de `ADMIN_API_TOKEN`. El secreto debe existir únicamente en el entorno QA y en el scheduler autorizado.

Commits:
- `9198981d796dfffe2852bcf870609e9d440ea1f8` — endpoint protegido.
- `f0ead03f2d74a8a83283adad05cb2d008b20d551` — pruebas de autenticación e invocación.

## Configuración no secreta requerida

- Método: POST.
- Frecuencia: equivalente a `0 * * * *`.
- Zona: America/Bogota o UTC equivalente documentado.
- Header: `Authorization: Bearer <secret>`.
- Secreto: `REMINDER_TRIGGER_TOKEN`, fuera de Git.
- Endpoint: URL QA + `/api/internal/reminders/dispatch`.

## Prueba real de cita 24 h

NO EJECUTADA en esta actuación. No existe evidencia accesible en esta sesión de un deployment QA que contenga los commits anteriores ni acceso operativo al D1 QA/scheduler para crear la cita sintética y disparar el trigger.

## Ejecución #1

PENDIENTE: debe producir respuesta observable y registro persistente.

## Ejecución #2

PENDIENTE: misma cita y misma ventana lógica; debe producir resultado observable sin segundo envío lógico.

## Idempotencia

La implementación y la prueba automatizada respaldan el diseño, pero no sustituyen la prueba real exigida. Falta acreditar:

`Trigger #1 → envío lógico 1`  
`Trigger #2 → sin nuevo envío`  
`appointment_reminders equivalentes → 1`

## Auditoría

Pendiente evidencia real de trigger, respuesta HTTP, proveedor y registro D1. No deben registrarse secretos ni datos reales de pacientes.

## Reconciliación QA ↔ GitHub

Pendiente. El último deployment QA históricamente documentado corresponde a una versión anterior. No se afirma que `f0ead03f...` esté desplegado.

## Regresión

Las suites históricas permanecen como evidencia previa. Las pruebas nuevas quedaron versionadas, pero esta actuación no declara ejecución CI/QA de los commits nuevos hasta que exista un run verificable asociado al SHA.

## Riesgos residuales

- El modo `legacy-service-admin` debe retirarse antes del endurecimiento productivo.
- El número comercial propio de WhatsApp y rotación de credenciales siguen siendo controles de producción según evidencia previa.

## Bloqueantes de gate

1. desplegar en QA el commit que contiene el endpoint;
2. configurar `REMINDER_TRIGGER_TOKEN` en QA y scheduler externo;
3. crear/identificar cita sintética confirmada en ventana 24 h;
4. ejecutar dos triggers reales;
5. demostrar un solo registro/envío lógico en D1;
6. conservar auditoría del proveedor;
7. reconciliar SHA → build/version → deployment QA;
8. ejecutar regresión sobre la versión desplegada.

## Conclusión

G3 permanece `READY_FOR_VERIFICATION`. No procede PASS mientras falte la cadena real reproducible en QA.
