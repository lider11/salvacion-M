# Salvación M — Reinicio 2026

Nueva base del proyecto en la rama `reinicio-2026-desde-cero`.

## Objetivo
Portal público de orientación para usuarios del sistema de salud colombiano, formulario de solicitudes, CRM administrativo independiente y gestión posterior de citas y recordatorios.

## Alcance de este commit
Solo estructura y documentación. No hay frontend funcional, API, CRM, base de datos, scheduler ni despliegue.

## Arquitectura aprobada
- HTML5 semántico, CSS3 responsive y JavaScript Vanilla.
- Backend Node.js LTS + Express, API REST modular.
- Base de datos por definir tras inventario de D1: SQLite en instancia persistente o PostgreSQL según despliegue.
- Jobs de recordatorios en Node.js, con persistencia e idempotencia; Sites no es runtime.
- GitHub únicamente para código fuente, documentación e historial; nunca como scheduler o despliegue automático.
- CRM separado del sitio público.
- Consulta inicial gratuita; no se incluye pasarela de pagos.

## Seguridad y calidad
Privacidad colombiana, autenticación, RBAC, CSRF, validación, accesibilidad WCAG 2.2 AA y pruebas por módulos. Ningún control se considera aprobado sin evidencia.

## Estado
`ARQUITECTURA_EXPRESS_DOCUMENTADA`. La implementación del backend y su despliegue siguen pendientes. Ver `docs/backend/`.

La rama `main` conserva el historial previo. No modificar producción sin autorización expresa.
