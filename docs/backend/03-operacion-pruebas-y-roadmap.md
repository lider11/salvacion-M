# Salvación M — Operación de Node.js, pruebas y fases
Fecha: 2026-11-08 | Estado: PLAN DE TRABAJO, NO OPERACIÓN VERIFICADA

## Fases de implementación
1. Inventario del frontend, repositorio, solicitudes, código y estado de D1; seleccionar hosting y persistencia.
2. Inicializar servidor Express, `app.js` sin efectos secundarios, configuración por entorno, endpoint de salud, manejo seguro de errores y logs.
3. Implementar `POST /api/v1/requests`, validación, persistencia transaccional e identificador; conectar formulario.
4. Implementar CRM con autenticación, sesiones, permisos, CSRF, consulta y actualización auditada.
5. Implementar citas con estados, fechas UTC y presentación `America/Bogota`.
6. Implementar adaptador de notificaciones y job de recordatorios 24 horas con idempotencia.
7. Ejecutar pruebas unitarias, integración, E2E, accesibilidad, seguridad, respaldo y recuperación. Documentar el resultado por funcionalidad.

## Scheduler e idempotencia
El proceso Node.js debe ejecutarse en infraestructura con reloj y política de reinicio controlados. No se usará GitHub Actions ni Sites. El despachador: busca citas elegibles, reserva atómicamente una clave lógica única por cita/tipo/ventana, registra intento, invoca proveedor, registra resultado, y reconcilia estados ambiguos. Reintentar únicamente bajo política segura y nunca interpretar timeout como fallo definitivo sin reconciliar. Verificar entrega en proveedor cuando sea posible. Dos pruebas con destinatario QA expresamente autorizado y cita sintética, sin mensajes a terceros.

## Criterios de aceptación verificables por módulo
- API: errores controlados, validación y persistencia consistente; ID real tras commit.
- CRM: roles y recursos restringidos, sesión revocable, CSRF y trazabilidad.
- Citas: estados válidos, concurrencia y zona horaria correctas.
- Notificaciones: deduplicación, trazas y manejo seguro de fallos.
- Seguridad: no secretos en repositorio, consultas parametrizadas, control contra abuso y exposición indebida.
- Accesibilidad: pruebas objetivas de WCAG 2.2 AA en flujos completos.
- Operación: arranque, healthcheck, backups, restauración, logs y alertas comprobados.
- Documentación: SHA, cambios, evidencia de pruebas, limitaciones y estado real por entrega.

## Método simplificado
INSPECCIONAR → DISEÑAR → IMPLEMENTAR → PROBAR → CORREGIR → DOCUMENTAR.
Usar estados `IMPLEMENTADO`, `VERIFICADO`, `PENDIENTE` y `BLOQUEADO` por funcionalidad. No utilizar G3 ni gates acumulativos. Nunca equiparar un commit con una prueba o con un despliegue.

## Qué no se ha realizado
No se ha instalado Node/Express, seleccionado hosting, migrado datos, iniciado servidor ni probado los endpoints por el hecho de crear estos documentos.
