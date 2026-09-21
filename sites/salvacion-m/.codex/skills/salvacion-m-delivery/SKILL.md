---
name: salvacion-m-delivery
description: Implementar, corregir o auditar los sprints de Salvación M usando sus decisiones aprobadas, memoria, criterios de terminado y evidencia reproducible. Úsala para trabajo de producto, sitio público, CRM, agenda, cumplimiento o cierre de sprint del proyecto; no la uses para asuntos jurídicos ajenos a Salvación M.
---

# Entrega de Salvación M

## Preparación

1. Leer el `AGENTS.md` más cercano y el archivo raíz `../AGENTS.md` cuando esté disponible.
2. Consultar `deliverables/00_GOBIERNO_DEL_PROYECTO/CONTEXTO_OPERATIVO.md` y solo los documentos del área afectada.
3. Revisar `deliverables/11_MEMORIA_DEL_AGENTE/MEMORIA.md` y la última parte de `BITACORA_ACTIVIDADES.md`.
4. Distinguir decisiones aprobadas, propuestas, hallazgos y pendientes. No convertir una inferencia en aprobación.

## Ejecución

- Si falta un dato que alteraría una decisión jurídica o comercial, detenerse y preguntar; no inventarlo.
- Resolver de oficio decisiones técnicas reversibles dentro del alcance aprobado.
- Mantener separados sitio público y CRM privado.
- Para datos de consultas, casos, citas, consentimiento o auditoría, usar persistencia central y nunca `localStorage` como fuente de verdad.
- Preservar la minimización de datos y evitar datos clínicos en la memoria general, bitácoras o registros de diagnóstico.

## Verificación

Antes de afirmar que una actividad está terminada:

1. Probar el comportamiento observable, incluidos errores y reintentos.
2. Para el flujo crítico, verificar formulario → servidor → base durable → CRM → agenda → actividad.
3. Confirmar que los datos persisten tras recarga y desde otro navegador.
4. Aplicar los controles pertinentes de privacidad, seguridad y WCAG definidos en `AGENTS.md`.
5. Solicitar una revisión independiente cuando se pretenda cerrar un sprint.

## Aprendizaje

Al terminar una actividad material:

- añadir la actividad y su evidencia a `BITACORA_ACTIVIDADES.md`;
- actualizar `MEMORIA.md` solo si surgió una decisión o aprendizaje reutilizable;
- convertir en procedimiento una corrección que se repita y tenga pasos estables;
- actualizar el changelog cuando cambie un entregable versionado.

No guardar credenciales, tokens, historias clínicas ni datos individuales sensibles en estos documentos.

