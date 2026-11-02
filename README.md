# Salvación M — Reinicio 2026

Nueva base del proyecto en la rama `reinicio-2026-desde-cero`.

## Objetivo
Portal público de orientación para usuarios del sistema de salud colombiano, formulario de solicitudes, CRM administrativo independiente y gestión posterior de citas y recordatorios.

## Alcance de este commit
Solo estructura y documentación. No hay frontend funcional, API, CRM, base de datos, scheduler ni despliegue.

## Arquitectura aprobada
- HTML5 semántico, CSS3 responsive y JavaScript Vanilla.
- D1/SQLite para persistencia y auditoría cuando se implemente.
- Sites/MCP para entornos, ejecución y scheduler autenticado.
- GitHub únicamente para código fuente, documentación e historial; nunca como scheduler o despliegue automático.
- CRM separado del sitio público.
- Consulta inicial gratuita; no se incluye pasarela de pagos.

## Seguridad y calidad
Privacidad colombiana, autenticación, RBAC, CSRF, validación, accesibilidad WCAG 2.2 AA y Gauntlet Loop 2026. Ningún control se considera aprobado sin evidencia.

## Estado
`REINICIO_DOCUMENTAL`. `G3_PASS = FALSE`. Ninguna funcionalidad ni ejecución real acreditada.

La rama `main` conserva el historial previo. No modificar producción sin autorización expresa.
