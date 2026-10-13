# AGENTS.md — Salvación M

Este repositorio usa un agente de proyecto para mantener cumplimiento, continuidad y trazabilidad.

## Agente principal

Ruta:

`.github/agents/salvacion-m-agent.md`

## Regla general

Antes de modificar código o declarar una tarea terminada:

1. leer la documentación aplicable;
2. revisar la memoria del sistema;
3. validar criterios de aceptación;
4. ejecutar pruebas pertinentes;
5. actualizar memoria si existe un cambio material.

## Restricciones del proyecto

- El CRM es independiente del frontend público.
- Los formularios deben persistir datos antes de confirmar éxito.
- No existe pasarela de pagos en el alcance actual.
- La consulta inicial es gratuita.
- El precio y alcance final se determinan después de la consulta.
- No deben almacenarse secretos en Git.
- Los cambios relevantes requieren trazabilidad.

## Gobernanza técnica — 13 de octubre de 2026

- GitHub (`lider11/salvacion-M`) es únicamente repositorio de código, documentación e historial. No es plataforma de ejecución, scheduler ni origen de despliegues automáticos.
- Prohibido usar GitHub Actions para recordatorios, CI operativa, despliegues o invocación de endpoints de Sites. Las pruebas se ejecutan localmente o en el entorno QA autorizado y sus evidencias deben indicar el SHA y la versión real comprobada.
- Sites/MCP autenticado es responsable del scheduler autónomo y de la operación del endpoint `POST /api/internal/reminders/dispatch`; no inferir activación o entrega a partir de código existente.
- No cambiar producción, secretos, destinatarios ni realizar envíos reales sin autorización aplicable y evidencia verificable.
- Mantener metodología Gauntlet Loop 2026: TAREA → MÉTODO → ESTÁNDAR → TERMINACIÓN; PLANIFICAR → CONSTRUIR → PROBAR → CRITICAR → CORREGIR → VERIFICAR. Separar diagnóstico `PASS`, `FAIL_REAL`, `NO_ACREDITADO`, `BLOCKED`, `NOT_RUN` de decisiones booleanas `TRUE/FALSE`.
- G3 requiere 7/7 controles acreditados con evidencia contemporánea del entorno y ausencia de defectos críticos/altos. Sin dicha evidencia, `G3_PASS = FALSE`.
