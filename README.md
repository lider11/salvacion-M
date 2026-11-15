# Salvación M

Portal de orientación para personas que enfrentan barreras de acceso al sistema de salud colombiano.

## Estado actual

Línea canónica: rama `main` (y PRs hacia ella).

| Pieza | Estado |
| --- | --- |
| Landing pública (HTML/CSS/JS) | En progreso — hero, 6 servicios interactivos, nosotros, proceso, footer de contacto |
| Formulario de solicitudes | UI + validación local; permanece en vista previa hasta aprobación del aviso y activación explícita |
| Privacidad | Borrador jurídico amplio (`privacidad.html`); pendiente aprobación |
| Backend API PHP | Implementación inicial local en `api/` y `backend/`; pendiente configuración MySQL y despliegue en Hostinger |
| CRM | Pendiente |
| Producción | Sin cambios sin autorización expresa |

**Decisión vigente del titular (2026-11-15): G3 y el SDD extenso quedan retirados como puertas globales de aprobación.** Su documentación y las antiguas evidencias QA son antecedentes, no requisitos activos de `main`. Cada entrega se verifica mediante criterios concretos y pruebas pertinentes; se mantienen los controles de seguridad, privacidad, accesibilidad y autorización de despliegue.

## Stack

- Frontend: HTML5, CSS3, JavaScript Vanilla
- Backend: PHP 8.2+ con PDO; API JSON para solicitudes
- Persistencia prevista para Hostinger: MySQL 8+; SQLite se usa en pruebas locales
- GitHub: solo código, documentación e historial — no scheduler ni despliegue operativo

## Cómo trabajar

1. Leer este README y `docs/08-memoria-del-sistema.md`
2. Cambiar una cosa a la vez, probarla, documentar el resultado
3. No afirmar éxito de una solicitud hasta persistirla de verdad
4. No tocar producción sin autorización expresa

Detalle de arquitectura: `docs/arquitectura-inicial.md`.  
Marca y diseño: `docs/ADN-MAESTRO-V2.md`, `docs/SISTEMA-DISENO-V2.md`.
Configuración y despliegue backend: `docs/backend-hostinger.md`.

## Ramas históricas

- `reinicio-2026-desde-cero`: experimentó SDD/backend largo; decisiones útiles (Express, retiro de G3) se consolidan aquí; el resto queda histórico.
- `trabajo-proceso-001`: rediseño UI experimental con artefactos SDD/Playwright; no forma parte de la línea canónica hasta una integración deliberada y simple.
