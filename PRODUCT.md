# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas y familias (pacientes y cuidadores) que enfrentan barreras de acceso al sistema de salud colombiano — negaciones, medicamentos, citas/autorizaciones, EPS/IPS — en situación de estrés y con poca claridad jurídica o médica.

## Product Purpose

Salvación M orienta y acompaña para comprender la situación y conocer opciones y rutas disponibles. Éxito: la persona entiende qué puede hacer a continuación y puede solicitar una consulta inicial gratuita. No sustituye atención médica de urgencia ni decide por la persona.

## Positioning

Orientación comprensible sobre opciones y rutas ante barreras de acceso, con consulta inicial gratuita, sin garantizar resultado médico, administrativo o judicial.

## Operating Context

Portal público de orientación → formulario de solicitud → (previsto) API que valida y persiste → CRM separado para seguimiento. Canales de contacto informativos en el pie. Uso típico en móvil, con alfabetización digital variable y posible baja conectividad.

## Capabilities and Constraints

- Portal HTML5 / CSS3 / JavaScript Vanilla; backend previsto Node.js LTS + Express; CRM separado del portal.
- Formulario: validación local; envío real solo tras API/persistencia; nunca simular éxito.
- Seis categorías de orientación: negación de servicios, medicamentos, citas y autorizaciones, incapacidades y prestaciones, dificultades con EPS/IPS, rutas de reclamación.
- No tocar producción sin autorización expresa.
- Textos legales (`privacidad.html` y afines) sujetos a revisión jurídica antes de producción.
- Undecided: motor de persistencia (SQLite vs PostgreSQL) al implementar la API.

## Brand Commitments

- Nombre: Salvación M.
- Voz: profesional, serena, rigurosa, respetuosa, transparente y accesible.
- Usar: orientación sobre opciones disponibles; claridad; confidencialidad. Evitar: garantías de tratamiento o tutela, urgencias artificiales, jerga sin explicación.
- Logo vectorial aprobado: `assets/logo-salvacion-m.svg` (y monocromo). Guía de marca en `docs/ADN-MAESTRO-V2.md` e identidad en `docs/IDENTIDAD-GRAFICA-LOGO.md`.

## Evidence on Hand

- Logo SVG aprobado e integrado.
- Imagen hero ilustrativa: `assets/hero-acompanamiento.png` (no acredita prestación clínica).
- Borrador de aviso de privacidad: `privacidad.html`.
- Ausencias que el trabajo futuro no debe fabricar: testimonios, cifras de éxito, sellos, clientes o benchmarks no autorizados.

## Product Principles

1. Claridad antes que promesa: explicar opciones y límites, no resultados.
2. Confianza por honestidad operativa: solo afirmar recepción cuando exista persistencia real.
3. Dignidad y confidencialidad: minimizar datos; consentimiento no preseleccionado cuando aplique.
4. Separación de sistemas: portal público, API y CRM no se mezclan.
5. Accesibilidad como requisito de producto, no como adorno.

## Accessibility & Inclusion

Objetivo WCAG 2.2 AA. Diseñar para lectura móvil, distintos niveles de alfabetización digital y baja conectividad. No presuponer capacidad jurídica ni consentimiento para divulgar información sensible.
