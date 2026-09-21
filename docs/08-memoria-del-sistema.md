# Memoria del sistema

## Finalidad

Este archivo conserva decisiones, cambios y actuaciones relevantes de Salvación M.

## Registro inicial — 20 de septiembre de 2026

### Definiciones consolidadas

- Nombre del proyecto: Salvación M.
- Enfoque: orientación y asesoría para usuarios del sistema de salud colombiano.
- Consulta inicial: gratuita.
- Precio y alcance: se determinan después de la consulta.
- Pasarela de pagos: no incluida.
- Correo: devergel@yahoo.com.
- WhatsApp: 3012370047.
- El CRM debe operar fuera del frontend público.
- El CRM debe estar disponible mediante enlace o ruta independiente.
- Los datos del formulario público deben llegar al CRM.
- El sistema debe mantener memoria de actividades.
- Se requiere manual de identidad corporativa.
- Se requiere manual de diseño de producto.
- La documentación del proyecto también debe poder organizarse en SharePoint.
- El desarrollo debe orientarse a mejores prácticas de arquitectura, UI/UX, accesibilidad, seguridad, privacidad y trazabilidad.

### Regla de mantenimiento

Toda modificación importante del sistema debe añadir una entrada con:

- Fecha.
- Cambio.
- Motivo.
- Archivos afectados.
- Validación realizada.
- Pendientes.


## Actualización — 20 de septiembre de 2026 — preparación para desarrollo

### Cambio

Se amplió el repositorio para que la documentación pueda utilizarse directamente como base de implementación del sitio web.

### Archivos añadidos

- docs/10-contenido-del-sitio.md
- docs/11-arquitectura-del-frontend.md
- docs/12-especificacion-formulario-api.md
- docs/13-sistema-de-diseno.md
- docs/14-checklist-implementacion.md
- .env.example

### Resultado

Quedaron definidos el contenido público, la arquitectura del frontend, el contrato inicial del formulario y API, la separación del CRM, el sistema de diseño base y la lista de tareas para comenzar a programar.

### Pendiente inmediato

Inicializar el código del frontend y conectar progresivamente la interfaz con el backend y el CRM.


## Actualización — 20 de septiembre de 2026 — agente operativo

### Cambio

Se creó el agente permanente de cumplimiento y continuidad del proyecto.

### Archivos

- .github/agents/salvacion-m-agent.md
- AGENTS.md
- docs/15-agent-operativo.md

### Función

El agente queda encargado de revisar requisitos, detectar incumplimientos, priorizar riesgos, corregir desviaciones dentro del alcance, validar cambios, verificar criterios de aceptación y mantener actualizada la memoria del sistema.

### Regla

Ningún sprint debe declararse terminado sin evidencia verificable, pruebas aplicables, documentación actualizada y memoria al día.


## Actualización — 20 de septiembre de 2026 — primera versión web vanilla

### Cambio

Se implementó la primera versión funcional del sitio público usando exclusivamente HTML, CSS y JavaScript vanilla.

### Archivos creados

- index.html
- styles.css
- script.js
- privacidad.html
- terminos.html
- .nojekyll

### Funcionalidades

- navegación responsive;
- hero y propuesta de valor;
- servicios;
- flujo de atención;
- bloque de transparencia;
- formulario con validación cliente;
- protección honeypot básica;
- contador de caracteres;
- estados accesibles de error;
- contacto por correo y WhatsApp;
- páginas legales iniciales;
- diseño responsive;
- preparación para GitHub Pages.

### Integración CRM

El formulario está preparado para enviar datos a `POST /api/leads`, pero deliberadamente no muestra éxito mientras no exista backend conectado. Esto cumple la regla de no confirmar persistencia inexistente.

### Pendiente

- implementar backend/API;
- persistencia;
- CRM;
- validación servidor;
- publicación/configuración definitiva de GitHub Pages;
- completar responsable de tratamiento y textos legales definitivos.


## Actualización — 20 de septiembre de 2026 — accesibilidad del header

### Cambio

Se mejoró la accesibilidad de la navegación principal y del menú móvil.

### Mejoras

- etiqueta accesible dinámica para abrir/cerrar menú;
- actualización de `aria-expanded`;
- icono visual alterna entre menú y cierre;
- movimiento de foco al primer enlace al abrir;
- cierre con tecla Escape y retorno de foco al botón;
- control de foco mediante teclado;
- cierre automático al cambiar a escritorio;
- objetivos táctiles mínimos de 44–48 px;
- soporte para `prefers-reduced-motion`;
- mejoras para modos de alto contraste / forced colors.

### Archivos afectados

- index.html
- script.js
- styles.css

### Validación

Se mantuvo la estructura semántica `header > nav`, el enlace de salto al contenido y la navegación por teclado.


## Actualización — 20 de septiembre de 2026 — refactorización CSS

### Cambio

Se refactorizó `styles.css` conservando la identidad visual existente y fortaleciendo accesibilidad, consistencia y mantenibilidad.

### Mejoras aplicadas

- nuevos tokens para foco, bordes, superficie oscura, pesos tipográficos y espaciado;
- foco visible de mayor contraste;
- estados visuales para campos con `aria-invalid="true"`;
- checkbox con mayor área interactiva y `accent-color`;
- señales adicionales de interacción mediante subrayado en enlaces;
- fallback para header translúcido y uso progresivo de `backdrop-filter`;
- clase `.prose` para controlar longitud de lectura;
- normalización de pesos tipográficos;
- sustitución de colores repetidos por tokens;
- ampliación de soporte para `forced-colors`;
- simplificación de `prefers-reduced-motion`.

### Archivo afectado

- styles.css

### Criterio

La refactorización es progresiva y evita reconstruir el diseño desde cero.


## Actualización — 20 de septiembre de 2026 — endurecimiento frontend fase 1

### Cambio

Se inició la fase de endurecimiento del frontend tras la auditoría integral.

### Mejoras aplicadas

- corrección del registro duplicado del listener del contador de caracteres;
- separación entre inicialización y actualización del contador;
- identificación visual de campos obligatorios sin duplicar información para lectores de pantalla;
- semántica reforzada mediante `aria-labelledby` en transparencia y contacto;
- aviso accesible en enlaces de WhatsApp que abren nueva pestaña;
- `scroll-margin-top` para evitar que el header sticky oculte destinos de navegación;
- refuerzo de objetivos táctiles y `touch-action`;
- soporte adicional para usuarios con preferencia de mayor contraste.

### Archivos afectados

- index.html
- styles.css
- script.js

### Validación

Se mantuvieron las asociaciones `label`, `aria-describedby`, `aria-invalid`, estados vivos del formulario, navegación por teclado y reducción de movimiento.

### Pendientes de endurecimiento

- pruebas automatizadas y manuales WCAG 2.2 AA en navegador;
- Lighthouse/Core Web Vitals sobre despliegue real;
- cabeceras HTTP de seguridad en el entorno de hosting;
- validación, rate limiting y controles antiabuso en backend;
- cierre del aviso de privacidad definitivo antes de producción.


## Actualización — 20 de septiembre de 2026 — auditoría automática WCAG

### Cambio

Se incorporó una capa formal de auditoría de accesibilidad y pruebas automatizadas de WCAG.

### Herramientas

- Pa11y CI.
- Playwright.
- Axe Core para navegador.

### Cobertura

Se auditan automáticamente las páginas públicas principales y se integran las pruebas al workflow de GitHub Actions.

### Archivos

- .pa11yci.json
- playwright.config.js
- tests/accessibility.spec.js
- docs/16-auditoria-accesibilidad.md
- package.json
- .github/workflows/frontend-validation.yml

### Regla de calidad

El pipeline debe fallar cuando se detecten violaciones automáticas de accesibilidad A/AA en las páginas auditadas.

### Limitación

La automatización no sustituye pruebas manuales con teclado, zoom, reflow ni tecnologías de asistencia reales.


## Actualización — 20 de septiembre de 2026 — corrección de pruebas WCAG en Windows

### Incidencia

La ejecución local de las pruebas de accesibilidad fallaba en Windows por dos causas:

- dependencia del comando `python -m http.server`, cuando Python no estaba disponible en PATH;
- configuración de Playwright importando `@playwright/test` sin tener ese paquete declarado directamente.

También se observó un error secundario de `wmic.exe ENOENT` provocado por el intento fallido de gestionar el proceso del servidor.

### Corrección

- se eliminó la dependencia de Python para levantar el servidor local;
- se añadió `http-server` como servidor Node multiplataforma;
- se añadió `@playwright/test` como dependencia directa;
- se reemplazó la dependencia genérica `playwright`;
- se creó el script `npm run serve`;
- Pa11y y Playwright ahora usan el mismo servidor Node;
- el workflow usa `npm run test:a11y:axe`.

### Resultado esperado

Las pruebas deben poder ejecutarse tanto en Windows como en GitHub Actions sin requerir Python ni WMIC.


## Actualización — 20 de septiembre de 2026 — resultado local de accesibilidad

### Resultado observado

- Axe + Playwright: 3 de 3 páginas superaron la auditoría automática.
- Pa11y: 3 de 3 URLs reportaron 0 errores.

### Incidencia residual

En Windows, `start-server-and-test` intentó invocar `wmic.exe` al cerrar o inspeccionar el proceso del servidor. Windows modernos pueden no incluir WMIC, generando `ENOENT` incluso después de que Pa11y haya completado correctamente.

### Corrección

Se eliminó `start-server-and-test` del flujo. Pa11y queda desacoplado del gestor de procesos problemático para Windows. El servidor se puede ejecutar con `npm run serve` en una terminal y la auditoría con `npm run test:a11y:pa11y` en otra.

### Estado

Las pruebas automáticas WCAG actuales pasan en las tres páginas auditadas; permanece pendiente la validación manual con tecnologías de asistencia.


## Actualización — 21 de septiembre de 2026 — auditoría manual WCAG superada

### Resultado

El responsable del proyecto informó que la auditoría manual de accesibilidad del frontend fue superada.

### Evidencia acumulada

- HTML, CSS y JavaScript pasan validación automatizada.
- Axe + Playwright: 3 de 3 páginas aprobadas.
- Pa11y: 3 de 3 URLs con 0 errores.
- Auditoría manual del frontend reportada como superada.

### Estado

La fase de accesibilidad del frontend estático se considera aprobada en su estado actual.

### Alcance de la aprobación

La aprobación no cubre todavía:

- comportamiento final con backend;
- integración con CRM;
- componentes dinámicos futuros;
- regresiones posteriores.

Debe repetirse la validación de accesibilidad cuando se incorporen cambios sustanciales.
