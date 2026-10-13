# Salvación M

**Salvación M** es una plataforma digital orientada a brindar información, orientación y servicios de asesoría a usuarios del Sistema General de Seguridad Social en Salud de Colombia.

El proyecto combina un sitio web público de captación y orientación con un **CRM administrativo independiente**, destinado a recibir y gestionar las solicitudes enviadas desde el formulario del sitio.

## Propósito

Facilitar el acceso de los usuarios a orientación clara, organizada y accesible frente a situaciones relacionadas con EPS, IPS y demás actores del sistema de salud colombiano.

## Alcance inicial

- Sitio web público de Salvación M.
- Formulario de contacto y solicitud de asesoría.
- Consulta inicial gratuita.
- Los precios y el alcance exacto de cada servicio se determinan después de la consulta.
- No se ofrece pasarela de pagos.
- Integración del formulario con un CRM administrativo.
- CRM accesible mediante una ruta o enlace independiente del frontend público.
- Seguimiento interno de solicitudes.
- Memoria y bitácora de actividades del sistema.
- Diseño responsive, accesible y orientado a experiencia de usuario.
- Enfoque en privacidad, protección de datos y seguridad.

## Contacto

- Correo: devergel@yahoo.com
- WhatsApp: 3012370047

## Arquitectura funcional

El sistema se divide conceptualmente en dos superficies:

1. **Frontend público**
   - Presentación de Salvación M.
   - Información de servicios.
   - Orientación al usuario.
   - Formulario de solicitud.
   - Avisos legales y tratamiento de datos.

2. **CRM administrativo**
   - Acceso independiente.
   - Recepción automática de los datos del formulario.
   - Gestión de leads y solicitudes.
   - Estados de atención.
   - Historial de actuaciones.
   - Trazabilidad.
   - Memoria operativa.

## Principios del producto

- Claridad.
- Confianza.
- Accesibilidad.
- Empatía sin promesas engañosas.
- Protección de datos.
- Seguridad por diseño.
- Trazabilidad.
- Separación entre portal público y administración interna.

## Estado

Repositorio de código fuente y documentación histórica. El estado operativo de las instancias Sites debe verificarse en cada entorno mediante sus herramientas autenticadas; los archivos y commits aquí conservados no acreditan por sí mismos un despliegue ni su funcionamiento.

Consulta la carpeta `docs/` para la documentación funcional y técnica.

## Copia versionada del código Sites

La carpeta `sites/salvacion-m/` contiene una copia del código del sitio, sus pruebas y configuración. **No debe asumirse que corresponde a la versión desplegada o activa**: contrastar SHA, versión y deployment ID con Sites antes de emitir diagnósticos o implementar cambios.

GitHub se utiliza exclusivamente para conservar y consultar el código y su historial. **No es scheduler, motor de ejecución operativa ni mecanismo de despliegue**. No usar GitHub Actions, eventos `schedule`, `workflow_dispatch` ni integraciones automáticas de GitHub con Sites para enviar recordatorios. La operación de QA y producción corresponde a Sites/MCP, con credenciales autenticadas y auditoría en D1. No modificar producción sin autorización específica.

La validación puede ejecutarse localmente o en el entorno QA autorizado; sus resultados no equivalen a ejecución real en Sites.

Para validar la copia de este directorio localmente:

```bash
cd sites/salvacion-m
npm install
npm test
npm run validate
```
