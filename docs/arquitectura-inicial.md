# Arquitectura inicial — versión desde cero

## Superficies previstas
1. **Sitio público:** información y formulario accesible.
2. **API:** validación, persistencia y controles de abuso.
3. **CRM administrativo:** acceso separado, autenticación, RBAC y auditoría.
4. **Citas y recordatorios:** scheduler autónomo autenticado en Sites, no GitHub Actions.
5. **D1/SQLite:** almacenamiento y trazabilidad.

## Orden de construcción
1. Contratos y criterios de aceptación.
2. HTML/CSS/JavaScript Vanilla del sitio público.
3. API y persistencia verificable.
4. CRM y seguridad.
5. Citas, scheduler y notificaciones.
6. QA adversarial, accesibilidad y G3.

## Límites actuales
Este documento es diseño, no implementación. No existe evidencia nueva de despliegue, persistencia, autenticación ni entregas.
