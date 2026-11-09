# Arquitectura inicial — versión desde cero

## Superficies previstas
1. **Sitio público:** información y formulario accesible.
2. **API:** validación, persistencia y controles de abuso.
3. **CRM administrativo:** acceso separado, autenticación, RBAC y auditoría.
4. **Citas y recordatorios:** jobs Node.js con registro persistente, exclusión mutua e idempotencia; no GitHub Actions.
5. **Persistencia:** seleccionar SQLite persistente o PostgreSQL tras inventario de D1 y plan de migración.
6. **Backend:** Node.js LTS y Express con API REST modular; Sites no se utilizará como runtime.

## Orden de construcción
1. Contratos y criterios de aceptación.
2. HTML/CSS/JavaScript Vanilla del sitio público.
3. API y persistencia verificable.
4. CRM y seguridad.
5. Citas, scheduler y notificaciones.
6. Pruebas de integración y accesibilidad, corrección de defectos y entrega documentada.

## Límites actuales
Este documento es diseño histórico actualizado por `docs/backend/01-arquitectura-node-express.md`, no implementación. No existe evidencia nueva de despliegue, persistencia, autenticación ni entregas.
