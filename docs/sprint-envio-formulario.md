# Diagnóstico y sprint de envío del formulario

Fecha: 2026-11-15. SHA inspeccionado: `9f6b345a79e0f9a46e7d3ba6283cb154f132919e`.

## Diagnóstico

El código local no implementa el envío de solicitudes desde el portal. No se ha demostrado un fallo de red o MySQL en Hostinger.

| Hallazgo | Evidencia | Consecuencia |
| --- | --- | --- |
| Formulario en vista previa | `index.html:249`, `method="dialog"`, `data-preview-only="true"` | No existe envío HTTP nativo configurado |
| Botón de envío oculto y deshabilitado | `index.html:364` | Solo se ofrece revisión local |
| Envío cancelado expresamente | `js/main.js:131`, evento submit con preventDefault | No sale una solicitud del navegador |
| Sin transporte HTTP hacia la API | No hay llamada fetch a requests.php en main.js | Retirar el atributo preview no conecta nada |
| Segundo controlador de formulario | `js/main.js:251` y `:421` | Fuera de preview sigue cancelando submit; riesgo de validaciones y mensajes duplicados |
| API preparada para persistir | `api/requests.php:163–176` | El código confirma transacción antes de responder 201; funcionamiento actual no ejecutado |
| Consentimiento aún de lectura de borrador | `index.html:353–359` | No debe convertirse automáticamente en consentimiento de tratamiento |
| Sin CRM ni notificaciones | Guía backend-hostinger | Guardar una solicitud no envía un correo al responsable |

La finalidad declarada es llamar al solicitante, pero teléfono es opcional: debe resolverse antes de activar ese flujo.

## Verificación y límites

- Inspección real de HTML, JavaScript, endpoint, configuración y guía de despliegue.
- `node --check js/main.js`: correcto.
- PHP no encontrado en PATH: pruebas HTTP/SQLite y lint PHP NO VERIFICADOS en esta sesión. Los resultados históricos no acreditan el estado actual.
- URL desplegada no identificada ni contrastada: navegador, PHP remoto, HTTPS, origen permitido, rutas privadas, credenciales y MySQL de Hostinger NO VERIFICADOS.
- No se modificó el código funcional ni se envió información personal. El diagnóstico corresponde al SHA indicado, no acredita qué versión sirve el dominio.

## Sprint propuesto: cinco días hábiles de trabajo

Objetivo: completar en staging el recorrido formulario → API → MySQL → confirmación con identificador. La publicación queda como tarea final condicionada a la configuración y autorización reales; los tiempos no incluyen esperas de acceso o decisiones del responsable.

| Día / prioridad | Trabajo | Responsable | Criterio de aceptación |
| --- | --- | --- | --- |
| 1 / P0 | Identificar URL y versión servida; crear o inspeccionar staging; verificar PHP/PDO/mbstring, HTTPS, tablas, permisos y rutas privadas | Desarrollo + titular para hPanel | Entorno separado y prueba sintética guardada en MySQL con identificador coincidente; secretos fuera del webroot y repositorio |
| 1 / P0, en paralelo | Completar identidad legal, canal de derechos, conservación/eliminación, aviso y versión; decidir teléfono obligatorio para llamadas | Titular con apoyo pertinente | Texto y decisiones concretos registrados; consentimiento informado desmarcado para activación real. Desarrollo puede usar versión ficticia en staging |
| 2 / P0 | Consolidar los dos controladores; separar claramente preview y envío; alinear validación con API | Desarrollo | Un solo flujo por interacción, errores accesibles y preview sin POST; campos acordes al contrato |
| 3 / P0 | Implementar JSON POST same-origin a /api/requests.php con consentimiento y privacy_version; estado de carga y prevención de doble clic | Desarrollo | Un envío válido produce 201, ok true e identificador válido tras commit; errores no borran campos ni muestran éxito |
| 4 / P0 | Ejecutar pruebas integradas MySQL y navegador: datos inválidos, versión incorrecta, origen no autorizado, límite, caída DB, red interrumpida y respuesta inválida | Desarrollo | Evidencia de estado HTTP, mensaje UI y persistencia por caso; nunca éxito sin respuesta confirmada. Si se pierde respuesta tras guardar, informar estado incierto y evitar reenvío automático |
| 5 / P1 | Verificar móvil, teclado, foco y mensajes; documentar revisión manual restringida, copia de seguridad, eliminación y reversión; preparar publicación | Desarrollo + titular | Titular puede localizar la solicitud ficticia sin panel público ni credenciales compartidas; restauración/reversión documentadas y ejecutables; activación pública solo con autorización expresa |

## Casos mínimos de aceptación

1. Datos válidos y consentimiento: 201 con ID y una fila correspondiente en MySQL.
2. Datos inválidos, consentimiento ausente o versión distinta: rechazo y ninguna solicitud guardada.
3. Origen ajeno o contenido no JSON: rechazo y ninguna solicitud guardada.
4. Límite por correo: 429 sin nueva solicitud; mensaje comprensible.
5. Base no disponible o fallo durante transacción: respuesta de error, sin éxito en UI ni registro parcial.
6. Respuesta HTML, JSON inválido o 201 sin ID: ningún éxito en UI.
7. Doble clic: un solo envío en curso; reintentos con resultado incierto no automáticos. Si se requiere garantía ante reintentos, implementar idempotencia persistente y probarla.
8. Preview: cero POST; formulario activo: consentimiento nunca preseleccionado.
9. Revisión desde móvil y teclado sin pérdida de campos ni mensajes inaccesibles.

## Alcance y riesgos

No incluye CRM, notificaciones automáticas ni frameworks. Si se espera recibir un correo por cada solicitud, será una entrega aparte con sus propias pruebas; no confundir ausencia de correo con ausencia de guardado.

No activar el formulario simplemente quitando disabled o preview. Riesgos principales: éxito falso, pérdida o duplicación por reintentos, recepción de datos sin aviso definitivo, secretos expuestos y discrepancia entre código local y desplegado. No realizar pruebas de caída contra producción.

Próximo insumo para diagnóstico remoto: URL exacta donde se presenta el problema y confirmación de si ya se subieron API y configuración a Hostinger. No solicitar contraseñas por chat.
