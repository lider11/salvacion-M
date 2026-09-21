# Memoria del sistema

## Finalidad

Este archivo conserva decisiones, cambios y actuaciones relevantes de Salvación M.

## Registro inicial — 20 de septiembre de 2026

### Definiciones consolidadas

- Nombre del proyecto: Salvación M.
- Enfoque: orientación y asesoría para usuarios del sistema de salud colombiano.
- Consulta inicial: gratuita.
- Precio y alcance: se determinan después de la consulta.
- Pasarela de pagos: no incluida.
- Correo: devergel@yahoo.com.
- WhatsApp: 3012370047.
- El CRM debe operar fuera del frontend público.
- El CRM debe estar disponible mediante enlace o ruta independiente.
- Los datos del formulario público deben llegar al CRM.
- El sistema debe mantener memoria de actividades.
- Se requiere manual de identidad corporativa.
- Se requiere manual de diseño de producto.
- La documentación del proyecto también debe poder organizarse en SharePoint.
- El desarrollo debe orientarse a mejores prácticas de arquitectura, UI/UX, accesibilidad, seguridad, privacidad y trazabilidad.

### Regla de mantenimiento

Toda modificación importante del sistema debe añadir una entrada con:

- Fecha.
- Cambio.
- Motivo.
- Archivos afectados.
- Validación realizada.
- Pendientes.


## Actualización — 20 de septiembre de 2026 — preparación para desarrollo

### Cambio

Se amplió el repositorio para que la documentación pueda utilizarse directamente como base de implementación del sitio web.

### Archivos añadidos

- docs/10-contenido-del-sitio.md
- docs/11-arquitectura-del-frontend.md
- docs/12-especificacion-formulario-api.md
- docs/13-sistema-de-diseno.md
- docs/14-checklist-implementacion.md
- .env.example

### Resultado

Quedaron definidos el contenido público, la arquitectura del frontend, el contrato inicial del formulario y API, la separación del CRM, el sistema de diseño base y la lista de tareas para comenzar a programar.

### Pendiente inmediato

Inicializar el código del frontend y conectar progresivamente la interfaz con el backend y el CRM.
