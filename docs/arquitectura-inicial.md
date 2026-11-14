# Arquitectura — Salvación M

Documento corto y vigente. Sustituye el SDD largo de backend como referencia operativa.

## Superficies

1. **Portal público** — información y, cuando exista, formulario accesible (HTML/CSS/JS).
2. **API** — validación, persistencia y límites de abuso (Node.js + Express).
3. **CRM** — interfaz separada, autenticación, roles y auditoría.
4. **Citas / recordatorios** — jobs Node.js con registro e idempotencia; no GitHub Actions.
5. **Base de datos** — elegir al implementar (SQLite o PostgreSQL).

## Orden práctico

1. Completar y estabilizar el portal público.
2. Formulario + API con persistencia real (éxito solo tras guardar).
3. CRM mínimo para revisar solicitudes.
4. Citas y recordatorios si hacen falta.
5. Pruebas de lo construido (incluyendo accesibilidad en flujos reales).

## Límites actuales

- Hay landing local; no hay formulario ni backend en código.
- Este documento no acredita despliegue ni operación.
- Producción no se modifica sin autorización expresa.
