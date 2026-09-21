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
