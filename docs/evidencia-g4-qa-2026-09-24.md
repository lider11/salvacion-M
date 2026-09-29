# Evidencia G4 — QA integral

Fecha: 2026-09-24  
Gate: G4  
Estado resultante: `READY_FOR_VERIFICATION`

## Criterios canónicos

G4 exige QA E2E, WCAG 2.2 AA, controles de seguridad inspirados en ASVS y regresión del sitio público, CRM y agenda, con cero hallazgos críticos o bloqueantes abiertos.

## Matriz implementada

| Área | Control automatizado | Evidencia |
|---|---|---|
| Frontend | Validación HTML, CSS y JavaScript | `npm run validate` |
| WCAG 2.2 AA | Pa11y y axe sobre inicio, privacidad y términos | `npm run test:a11y:pa11y`; `npm run test:a11y:axe` |
| Teclado | Errores accesibles, foco inicial inválido, menú móvil y Escape | `tests/accessibility.spec.js` |
| E2E datos | Formulario → D1 → CRM separado con referencia idéntica | `sites/salvacion-m/tests/integration.test.mjs` |
| Agenda | Disponibilidad, estados, reprogramación, no doble reserva y auditoría | `sites/salvacion-m/tests/integration.test.mjs` |
| Identidad/RBAC | Actor verificado, lector sin escritura y auditoría atribuible | pruebas Worker/integración |
| ASVS/API | `no-store`, CSP, HSTS, anti-frame, permisos, CORS restringido, JSON y enumeraciones inválidas | `sites/salvacion-m/tests/worker.test.mjs` |
| CI | Resumen preservado como artefacto por 30 días | `.github/workflows/frontend-validation.yml` |

## Regla de ejecución

La orden local reproducible es:

```bash
npm run test:g4
```

La misma cobertura queda separada en GitHub Actions para identificar con precisión la capa que falle.
El orquestador inicia y espera el servidor local antes de Pa11y/axe, y lo cierra al terminar para que la ejecución sea reproducible fuera de CI.

## Hallazgo corregido durante la ejecución

- Hallazgo: el menú móvil permanecía oculto en navegadores sin soporte para media queries de rango (`width <= …`).
- Causa: sintaxis CSS moderna sin fallback compatible.
- Corrección: sustitución equivalente por `max-width` en los cuatro breakpoints afectados.
- Prueba de regresión: activación por teclado, cierre con `Escape` y retorno de foco.

## Límite de la evidencia

La automatización no sustituye pruebas manuales con lector de pantalla, zoom/reflow, contraste en condiciones reales ni una prueba de penetración.

## Resultado de ejecución local

- Validación HTML/CSS/JavaScript: `PASS`.
- Pa11y: `3/3 PASS`, cero errores.
- axe + Playwright: `5/5 PASS`.
- Worker, D1, CRM, agenda y contratos de seguridad: `26/26 PASS`.
- Hallazgos críticos o bloqueantes automatizados abiertos: `0`.

G4 queda `READY_FOR_VERIFICATION`. No se declara `PASS` hasta confirmar la ejecución en CI y completar/revalidar las comprobaciones manuales no automatizables.
