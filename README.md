# Salvación M

Portal de orientación para personas que enfrentan barreras de acceso al sistema de salud colombiano.

## Estado actual

Línea canónica: rama `main` (y PRs hacia ella).

| Pieza | Estado |
|---|---|
| Landing pública (HTML/CSS/JS) | En progreso — hero, 6 servicios interactivos, nosotros, proceso, transparencia, footer de contacto |
| Formulario de solicitudes | UI + validación local; envío deshabilitado hasta API/persistencia |
| Privacidad | Borrador jurídico amplio (`privacidad.html`); pendiente aprobación |
| Backend API | Pendiente (Node.js + Express cuando se implemente) |
| CRM | Pendiente |
| Producción | Sin cambios sin autorización expresa |

No hay gate global tipo G3. Cada entrega se verifica por lo que realmente se construyó y se probó.

## Stack

- Frontend: HTML5, CSS3, JavaScript Vanilla
- Backend previsto: Node.js LTS + Express (API REST modular)
- Persistencia: por definir al implementar (SQLite o PostgreSQL)
- GitHub: solo código, documentación e historial — no scheduler ni despliegue operativo

## Cómo trabajar

1. Leer este README y `docs/08-memoria-del-sistema.md`
2. Cambiar una cosa a la vez, probarla, documentar el resultado
3. No afirmar éxito de una solicitud hasta persistirla de verdad
4. No tocar producción sin autorización expresa

Detalle de arquitectura: `docs/arquitectura-inicial.md`.  
Marca y diseño: `docs/ADN-MAESTRO-V2.md`, `docs/SISTEMA-DISENO-V2.md`.

## Ramas históricas

- `reinicio-2026-desde-cero`: experimentó SDD/backend largo; decisiones útiles (Express, retiro de G3) se consolidan aquí; el resto queda histórico.
- `trabajo-proceso-001`: rediseño UI experimental con artefactos SDD/Playwright; no forma parte de la línea canónica hasta una integración deliberada y simple.
