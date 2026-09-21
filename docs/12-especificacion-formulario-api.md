# Especificación del formulario y API

## Formulario público

### Campos

Obligatorios:

- nombre
- telefono
- correo
- ciudad
- tipoSolicitud
- descripcion
- aceptaPrivacidad

Opcionales:

- eps
- preferenciaContacto

Evitar solicitar documento de identidad en la primera captura salvo que exista necesidad concreta.

## Validaciones

- Nombre: 2 a 120 caracteres.
- Teléfono: formato válido para Colombia o internacional.
- Correo: formato válido.
- Ciudad: 2 a 100 caracteres.
- Tipo de solicitud: valor de catálogo.
- Descripción: 20 a 3000 caracteres.
- Aceptación de privacidad: obligatoria.
- Honeypot o mecanismo equivalente contra bots.
- Rate limiting en backend.

## Endpoint sugerido

`POST /api/leads`

### Request

```json
{
  "nombre": "Nombre del usuario",
  "telefono": "3000000000",
  "correo": "usuario@correo.com",
  "ciudad": "Barranquilla",
  "eps": "EPS ejemplo",
  "tipoSolicitud": "negacion-servicio",
  "descripcion": "Descripción del caso",
  "preferenciaContacto": "whatsapp",
  "aceptaPrivacidad": true
}
```

### Respuesta exitosa

```json
{
  "ok": true,
  "id": "LEAD-2026-000001",
  "message": "Solicitud recibida correctamente."
}
```

### Error de validación

HTTP 400

```json
{
  "ok": false,
  "error": "VALIDATION_ERROR",
  "fields": {
    "correo": "Correo inválido"
  }
}
```

## Flujo de persistencia

1. Recibir formulario.
2. Validar y sanitizar.
3. Registrar solicitud.
4. Crear evento de auditoría.
5. Devolver ID.
6. Mostrar confirmación al usuario.
7. Hacer disponible el registro en el CRM.

## Regla crítica

El frontend nunca debe marcar el envío como exitoso si el backend no confirma persistencia.
