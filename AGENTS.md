# AGENTS.md — Salvación M (reinicio)

## Antes de implementar
Leer `README.md` y `docs/08-memoria-del-sistema.md`. Inspeccionar el código y documentar riesgos antes de modificar.

## Método Gauntlet Loop 2026
TAREA → MÉTODO → ESTÁNDAR → TERMINACIÓN.
PLANIFICAR → CONSTRUIR → PROBAR → CRITICAR → CORREGIR → VERIFICAR.
Roles lógicos: Constructor, Crítico Adversarial y Árbitro. Máximo tres correcciones y dos rondas adversariales por defecto.

## Restricciones
- HTML5, CSS3 y JavaScript Vanilla; no introducir frameworks sin autorización.
- GitHub conserva código e historial. No usar GitHub Actions para scheduler ni despliegues operativos.
- No tocar producción sin autorización expresa.
- No registrar secretos, datos personales reales ni información de salud en el repositorio.
- Persistir solicitudes antes de afirmar éxito.
- Separar portal público, CRM y servicios internos.
- Exigir autenticación, RBAC, CSRF, controles contra XSS e inyección SQL, auditoría y mínimo privilegio.
- Objetivo WCAG 2.2 AA.

## Verificación
Diagnósticos: PASS, FAIL_REAL, NO_ACREDITADO, BLOCKED, NOT_RUN.
Cada requisito se evalúa TRUE/FALSE; sin evidencia verificable, FALSE.
G3 requiere siete criterios acreditados, pruebas y ausencia de defectos críticos o altos. De lo contrario `G3_PASS = FALSE`.
