# CRM administrativo

## Objetivo

Centralizar las solicitudes recibidas desde el sitio público y permitir su seguimiento operativo.

## Datos mínimos sugeridos

- ID de solicitud
- Fecha y hora
- Nombre
- Documento, solo si resulta necesario y existe base de tratamiento
- Teléfono
- Correo
- Ciudad
- EPS
- Tipo de solicitud
- Descripción
- Consentimiento de tratamiento de datos
- Estado
- Responsable interno
- Observaciones
- Última actuación
- Próxima acción
- Fecha de cierre

## Requisito de integración

Toda solicitud válida enviada desde el formulario del sitio debe almacenarse en el CRM.

## Acceso

El CRM debe disponer de:

- URL independiente.
- Autenticación.
- Roles.
- Sesiones seguras.
- Cierre de sesión.
- Restricción de vistas según permisos.

## Trazabilidad

Toda modificación sensible debe registrar:

- Usuario.
- Fecha.
- Acción.
- Registro afectado.
- Valor anterior y nuevo, cuando aplique.

## Memoria operativa

El sistema debe conservar una memoria de actividades que permita reconstruir:

- Cambios funcionales.
- Decisiones de diseño.
- Incidencias.
- Correcciones.
- Implementaciones.
- Validaciones.
- Estado de cada sprint.
