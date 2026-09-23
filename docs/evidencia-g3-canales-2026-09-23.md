# Evidencia G3 — canales de recordatorio

Fecha: 2026-09-23  
Gate: G3  
Requisito: `REMINDERS`

## Correo electrónico

- Proveedor: Brevo.
- Remitente configurado: `SALVACIÓN M <devergel@yahoo.com>`.
- Destinatario de la prueba autorizada: `devergel@yahoo.com`.
- Referencia: `SM-G3-PRUEBA`.
- Resultado observable del Worker: HTTP 200, proveedor `brevo`, respuesta del proveedor HTTP 201.
- Resultado observable en Brevo: mensaje «Recordatorio de cita – SALVACIÓN M» marcado como `Entregado` el 23/09/2026 a las 15:00.
- Despliegue QA: `appgdep_6ab42fd39ee48191826e35ec53122a4f`.
- Versión QA: `appgprj_6ab1f0bab8e88191a82ba8acd54d9a40~appgver_b0af6e377afc819185fee5d20323322f`.
- Código desplegado: `c9615c158d699e71095c7e41b68759e73e849af3`.
- Suite local del proyecto Sites: 23/23 pruebas aprobadas durante la verificación del proveedor.
- Secretos: no se registran valores de claves API en esta evidencia ni en Git.

Resultado del canal correo: `PASS` como prueba real de entrega del proveedor.

## WhatsApp

- Meta Business Portfolio: `Salvacion M` (`28935070716180341`).
- Cuenta de WhatsApp Business: `Daniel Abogado` (`1366452185161160`).
- Número: `+57 301 237 0047`.
- Identificador de número de teléfono: `948035151728039`.
- Inspección en Meta WhatsApp Manager: el número aparece asignado a la cuenta, pero su estado operativo es `Sin conexión`.
- Inspección en Meta for Developers: la sesión redirige al inicio y ofrece `Empezar`; no se identificó una aplicación de desarrollador existente que permita ejecutar una prueba reproducible de Cloud API.
- No se creó una aplicación, token persistente ni se envió un mensaje, para no generar credenciales o comunicaciones externas sin la confirmación puntual exigida.

Resultado del canal WhatsApp: `FAIL` para entrega API reproducible. La pertenencia del número está verificada, pero el canal no está conectado.

## Causa raíz y próxima corrección

El número de WhatsApp Business existe en el portafolio, pero no hay una integración activa y verificable con WhatsApp Cloud API. Para completar la validación se requiere registrar o vincular una aplicación de Meta, generar una credencial con el alcance mínimo, conectar el número y ejecutar un mensaje de prueba autorizado hacia un destinatario distinto o habilitado para pruebas.

G3 permanece como máximo en `READY_FOR_VERIFICATION`; esta evidencia no autoriza su transición a `PASS`.
