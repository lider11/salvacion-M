# SALVACIÓN M — ADN maestro de marca y producto
**Versión:** 2.0.0 | **Estado:** APROBADO EN DIRECCIÓN VISUAL; especificación documental | **Fecha:** 2026-11-02

## 1. Propósito y posicionamiento
Salvación M es una plataforma colombiana de orientación y acompañamiento para personas y familias que encuentran barreras de acceso al sistema de salud. Su promesa es explicar opciones y facilitar orientación profesional con lenguaje comprensible, sin garantizar decisiones médicas, administrativas ni judiciales.

**Territorio de marca:** confianza institucional + cercanía humana + claridad sobre derechos y rutas de atención.
**Personalidad:** profesional, serena, rigurosa, respetuosa, transparente y accesible.
**Valores:** dignidad, claridad, confidencialidad, empatía, responsabilidad, trazabilidad y protección de derechos.

## 2. Propuesta de valor
**Titular principal:** Orientación clara para defender tu acceso a la salud.
**Texto de apoyo:** Cuando enfrentas demoras, negaciones, dificultades con medicamentos o barreras de atención, te ayudamos a comprender tu situación y conocer los pasos que puedes seguir.
**CTA primario:** Solicitar consulta gratuita.
**CTA secundario:** Hablar por WhatsApp.
**Transparencia:** La consulta inicial es gratuita. El alcance y precio de eventuales servicios posteriores se informan antes de su contratación. No existe pasarela de pagos en el alcance inicial.

## 3. Audiencias
Personas usuarias del sistema de salud colombiano, pacientes y familiares o cuidadores que requieren orientación. Diseñar para distintos niveles de alfabetización digital, lectura móvil, baja conectividad y necesidades de accesibilidad. No presuponer capacidad jurídica ni consentimiento para divulgar información sensible.

## 4. Servicios informativos iniciales
- Negación de tratamientos o procedimientos.
- Demoras en citas y autorizaciones.
- Medicamentos no entregados.
- Incapacidades y prestaciones.
- Dificultades con EPS o IPS.
- Rutas de reclamación y orientación sobre alternativas.

Las fichas describirán alcance y límites de cada servicio. Evitar afirmar que todas las situaciones tienen una misma vía jurídica o un resultado asegurado.

## 5. Arquitectura de información pública
1. Inicio: valor, CTA, confianza y orientación.
2. Servicios: categorías comprensibles.
3. Cómo funciona: solicitud → revisión → contacto → orientación.
4. Confianza y transparencia: límites, gratuidad inicial, privacidad.
5. Solicitar orientación: formulario accesible y consentimiento diferenciado.
6. Contacto: canales vigentes, sin publicar datos personales no aprobados.
7. Privacidad y términos: textos jurídicos sujetos a revisión antes de producción.

## 6. Flujo del usuario
Visita → identifica necesidad → comprende condiciones → envía solicitud → API valida y persiste → confirma recepción con identificador → CRM independiente recibe/consulta solicitud → seguimiento y eventual cita. Nunca mostrar éxito por el mero envío del navegador ni simular persistencia.

## 7. Voz y microcopy
**Usar:** “Te orientamos sobre las opciones disponibles”; “Cuéntanos brevemente qué necesitas”; “Recibimos tu solicitud”.
**Evitar:** “Garantizamos tu tratamiento”, “Ganamos tu tutela”, “Solucionamos cualquier caso”, urgencias artificiales, lenguaje médico o jurídico sin explicación.
En errores: indicar qué ocurrió, cómo corregirlo y si la solicitud fue recibida o no; no revelar detalles internos.

## 8. Confianza, ética y datos
Minimizar datos, evitar pedir historia clínica en el primer contacto salvo justificación y controles adecuados; informar responsable, finalidad, derechos y canales de atención conforme a normativa colombiana aplicable. Consentimiento no preseleccionado cuando sea exigible. No mostrar testimonios, cifras de éxito ni sellos sin autorización y evidencia. El sitio no sustituye atención médica de urgencia.

## 9. Arquitectura técnica
HTML5, CSS3 y JavaScript Vanilla en el portal. Backend previsto: Node.js LTS + Express. Persistencia por definir al implementar. CRM separado del portal. GitHub solo como repositorio de código e historial, no scheduler ni despliegue. No usar GitHub Actions para recordatorios. No tocar producción sin autorización expresa.

## 10. Indicadores de experiencia propuestos
Comprensión de propuesta de valor; tasa de inicio y finalización de formulario; errores de validación; recepción persistida; accesibilidad móvil y teclado; tiempo de respuesta del proceso. Son objetivos de medición, no métricas obtenidas.

## 11. Criterios prácticos
- Identidad, mensajes, límites y CTA coherentes.
- Formularios con etiquetas y errores claros; confirmar recepción solo tras persistir.
- Portal, API y CRM separados cuando existan.
- Textos legales revisados antes de publicar.
- Probar accesibilidad y seguridad en lo que se entregue, sin gates globales.

## 12. Estado
ADN vigente como guía de producto y marca. No acredita por sí solo implementación ni despliegue.
