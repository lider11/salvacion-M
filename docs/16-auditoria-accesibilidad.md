# Auditoría de accesibilidad — Salvación M

Fecha: 20 de septiembre de 2026

## Alcance

Se revisó el frontend estático actual con foco en WCAG 2.2 nivel AA y en criterios que pueden automatizarse sin sustituir la revisión manual.

## Fortalezas actuales

- idioma de documento definido;
- enlace para saltar al contenido principal;
- landmarks semánticos `header`, `nav`, `main` y `footer`;
- navegación móvil con `aria-expanded`, cierre con Escape y manejo de foco;
- asociación de etiquetas con controles del formulario;
- uso de `aria-describedby` para errores;
- uso de `aria-invalid`;
- región viva para estados del formulario;
- objetivos táctiles reforzados;
- soporte para reducción de movimiento;
- soporte para mayor contraste y forced colors;
- indicación accesible para enlaces que abren nueva pestaña.

## Riesgos que siguen requiriendo validación manual

Las pruebas automatizadas no pueden verificar por sí solas:

- claridad real del contenido;
- orden lógico de foco en todos los flujos;
- calidad de la experiencia con lector de pantalla;
- adecuación del texto de enlaces fuera de contexto;
- reflow y zoom al 200–400 %;
- contraste de estados visuales en todas las combinaciones;
- accesibilidad cognitiva y comprensión del lenguaje;
- compatibilidad con tecnologías de asistencia reales;
- comportamiento final del formulario cuando exista backend.

## Automatización añadida

### Pa11y CI

Se añade `.pa11yci.json` para auditar:

- `index.html`
- `privacidad.html`
- `terminos.html`

El estándar configurado es WCAG 2 AA.

### Axe + Playwright

Se añade una segunda capa automatizada con `@axe-core/playwright` y Playwright, usando etiquetas:

- WCAG 2.0 A
- WCAG 2.0 AA
- WCAG 2.1 A
- WCAG 2.1 AA
- WCAG 2.2 AA

## Comandos

Auditoría completa:

```bash
npm install
npx playwright install chromium
npm run validate
npx playwright test
```

Solo Pa11y:

```bash
npm run test:a11y
```

## Criterio de aceptación

No deben existir violaciones automáticas de nivel A/AA en las páginas auditadas. Cualquier excepción futura deberá quedar documentada con causa, impacto, criterio WCAG relacionado y plan de corrección.

## Checklist manual

Prueba manual reportada como superada por el responsable del proyecto.

- [x] Navegación completa solo con teclado.
- [x] Zoom 200 % y 400 %.
- [x] Reflow a 320 CSS px.
- [x] Contraste de estados interactivos.
- [x] Orientación portrait/landscape.
- [x] Errores del formulario revisados manualmente.
- [x] Foco visible en los elementos interactivos.

### Tecnologías de asistencia

- [x] Validación manual principal superada.
- [ ] NVDA + Chrome/Firefox — recomendable como evidencia complementaria si no se documentó expresamente durante la prueba.
- [ ] VoiceOver + Safari — recomendable para cobertura multiplataforma.

### Pendiente condicionado

- [ ] Validación final del formulario con backend y CRM conectados.

## Estado de accesibilidad

**Estado actual: APROBADA EN LA FASE FRONTEND ESTÁTICO.**

La conclusión se limita al estado actual del sitio. La accesibilidad debe volver a validarse cuando se incorporen backend, CRM, nuevos componentes, contenido dinámico o cambios sustanciales de interfaz.
