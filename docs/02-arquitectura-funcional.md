# Arquitectura funcional

## 1. Portal público

Responsabilidades:

- Comunicar la identidad de Salvación M.
- Explicar servicios y alcance.
- Permitir al usuario solicitar una consulta.
- Capturar datos mínimos necesarios.
- Mostrar políticas y avisos legales.
- Facilitar contacto por WhatsApp y correo.

## 2. CRM administrativo

El CRM debe funcionar fuera del frontend público y mediante una URL o ruta independiente.

Responsabilidades:

- Recibir automáticamente las solicitudes enviadas desde el formulario.
- Asignar identificador interno.
- Registrar fecha y hora.
- Gestionar estado del caso.
- Añadir observaciones internas.
- Registrar contactos y seguimientos.
- Mantener historial de cambios.
- Permitir búsquedas y filtros.
- Mantener bitácora de actividad.

## 3. Flujo principal

Usuario -> Formulario web -> API/Backend -> Base de datos -> CRM administrativo

## 4. Estados sugeridos

- Nuevo
- Pendiente de revisión
- Contactado
- En consulta
- Pendiente de documentos
- Propuesta enviada
- En gestión
- Cerrado
- No viable

## 5. Seguridad

- Validación de entradas.
- Control de acceso al CRM.
- Separación de privilegios.
- Registro de auditoría.
- Protección frente a inyección y XSS.
- Rate limiting.
- Gestión segura de secretos.
- HTTPS obligatorio en producción.
