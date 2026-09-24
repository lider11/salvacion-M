# Evidencia G3 — WhatsApp Cloud API

Fecha: 2026-09-24  
Gate: G3  
Requisito: `REMINDERS / WHATSAPP_CLOUD_API`

## Actuación autorizada

- Se creó la aplicación de Meta **Salvacion M Mensajeria** (`1465797152126947`).
- Se vinculó el portafolio **Salvacion M** (`28935070716180341`).
- Se concedió alcance limitado a las cuentas de WhatsApp necesarias para la prueba.
- Se verificó como destinatario de prueba el número comercial terminado en `0047`.
- Se ejecutó un envío real autorizado mediante la plantilla de demostración **Order confirmed**.

## Resultado observable

- Meta informó que el mensaje fue enviado al destinatario verificado.
- El destinatario aportó captura de recepción en WhatsApp desde el número técnico de prueba `+1 (555) 137-4650`.
- La captura muestra el contenido de la plantilla, el origen `developers.facebook.com` y la conversación administrada mediante el servicio seguro de Meta.
- Resultado de entrega extremo a extremo: `PASS`.

## Alcance y seguridad

- La prueba acredita la conectividad de la aplicación con WhatsApp Cloud API y la entrega a un destinatario real autorizado.
- No acredita todavía la operación productiva desde el número comercial propio, que permanece como actividad posterior de configuración.
- No se almacenan tokens, códigos de verificación ni secretos en Git.
- El token temporal usado durante la prueba debe revocarse o rotarse antes de una configuración productiva.

## Reconciliación

Esta evidencia sustituye únicamente el resultado `FAIL` del apartado WhatsApp en `docs/evidencia-g3-canales-2026-09-23.md`. Los restantes requisitos de G3 conservan el estado que determine la fuente canónica hasta su reconciliación completa.
