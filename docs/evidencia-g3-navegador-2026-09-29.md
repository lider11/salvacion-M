# G3 — revisión real de navegador y bloqueo de envío

Fecha: 2026-09-29 UTC (noche del 28 en Colombia).

Estado: PENDIENTE; no acredita PASS.

## Versiones revisadas

- CRM QA v10, commit a8ca6b33a4a71d6a56191f1f38736ebc6118433c.
- Backend QA v12, commit f5f760c03d8bc6cfbe593f73b9ef7f4cf2eaeaae.

## Observación real en navegador

CRM privado abrió correctamente y mostró 10 casos, 10 nuevos, 0 cerrados y 3 citas activas. Se inspeccionó visualmente Flujo G3 en escritorio: selector operativo, pasos legibles sin superposición observada y expediente SM-2026-000010 con 0/7 criterios. Al abrir Revisión de cierre, la interfaz bloqueó correctamente el cierre por falta de siete criterios y trasladó el foco al encabezado.

Recordatorios cargó desde el backend: 0 registrados, 0 aceptados, 0 pendientes y 0 errores. Mostró correctamente ausencia de citas confirmadas en ventana, historial vacío y auditoría vacía. Presentación de escritorio legible. No se certifica todavía prueba móvil ni auditoría completa de accesibilidad.

## Evidencia de bloqueo

GitHub Actions run 36513104566, job 109229377401, 2026-09-29T02:32:52Z: `Sites authentication health HTTP: 401`. La ejecución falló antes del POST de dispatch.

https://github.com/lider11/salvacion-M/actions/runs/36513104566

Lectura directa de D1: appointment_reminders vacío. No había cita confirmada en la ventana vigente. No se enviaron correos reales en esta revisión. No hay prueba nueva de entrega de Brevo ni de repetición idempotente.

Destinatario de QA respaldado por docs/evidencia-g3-canales-2026-09-23.md: devergel@yahoo.com. Los clientes existentes usan correos sintéticos .invalid; no deben usarse para la prueba real.

## Continuación necesaria

Corregir autenticación de Sites usada por SITES_QA_AUTHORIZATION en environment qa sin ampliar acceso ni exponer secretos; confirmar health 200; crear cita sintética con destinatario autorizado en ventana; ejecutar scheduler dos veces; correlacionar auditoría D1 y entrega Brevo; completar prueba visual pendiente, documentación y revisión canónica. El cambio de credencial mediante navegador requiere entrada y guardado por el usuario según la política del navegador.
