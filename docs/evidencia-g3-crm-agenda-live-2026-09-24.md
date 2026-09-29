# Evidencia G3 — CRM y agenda QA en vivo

Fecha: 2026-09-24  
Entorno: `Salvación M CRM QA`  
URL: `https://salvacion-m-crm-qa.devergel1980.chatgpt.site`

## Resultado observable

La inspección autenticada del CRM QA mostró:

- 10 consultas sintéticas;
- 10 consultas en estado `Nuevo`;
- 3 citas activas;
- referencias `SM-2026-000001` a `SM-2026-000010` visibles en CRM;
- consultas con y sin cita, conservando el vínculo esperado;
- citas en estados `Solicitada`, `Confirmada` y `Cancelada`;
- zona horaria visible: Colombia;
- profesional visible: `Daniel Vergel`;
- búsqueda y filtro de estado;
- vista separada de casos y agenda;
- formulario de disponibilidad por profesional, fecha y franja horaria;
- acciones visibles de confirmar, reprogramar, cancelar, marcar atendida o no asistencia;
- alternativa de lista semántica accesible para la agenda.

Entre los registros observados se encontraban únicamente datos sintéticos `example.invalid`, teléfono `3000000000` y direcciones identificadas como QA.

## Requisitos respaldados

- `CLIENT_CONSULTATION_APPOINTMENT_LINK`: flujo persistido y visible en el CRM QA.
- `AGENDA_CRM_UI`: interfaz operativa y separada del frontend público.
- `PROFESSIONAL_AVAILABILITY`: controles visibles y backend cubierto por pruebas de integración.
- `D1_QA_MIGRATION`: el entorno desplegado consulta tablas de consultas, citas y disponibilidad sin error de esquema.

## Límites

La inspección fue de solo lectura: no se alteraron estados ni datos. La atribución individual se acredita mediante la prueba de backend y el despliegue QA documentados en `evidencia-g3-identidad-qa-2026-09-24.md`.

La ausencia de una automatización programada asociada al Site mantiene abierto el cierre operativo de `REMINDERS`.
