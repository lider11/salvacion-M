# AGENTS.md — Salvación M (reinicio)

## Antes de implementar
Leer `README.md` y `docs/08-memoria-del-sistema.md`. Inspeccionar el código y documentar riesgos antes de modificar.

## Método de trabajo simplificado
INSPECCIONAR → DISEÑAR → IMPLEMENTAR → PROBAR → DOCUMENTAR. Registrar defectos relevantes, corregirlos y repetir las pruebas afectadas. No utilizar gates G3 ni certificaciones artificiales.

## Restricciones
- HTML5, CSS3 y JavaScript Vanilla para frontend; Node.js LTS y Express para backend. No introducir frameworks adicionales sin autorización.
- GitHub conserva código e historial. No usar GitHub Actions para scheduler ni despliegues operativos. No usar Sites como runtime del backend.
- No tocar producción sin autorización expresa.
- No registrar secretos, datos personales reales ni información de salud en el repositorio.
- Persistir solicitudes antes de afirmar éxito.
- Separar portal público, CRM y servicios internos.
- Exigir autenticación, RBAC, CSRF, controles contra XSS e inyección SQL, auditoría y mínimo privilegio.
- Objetivo WCAG 2.2 AA.

## Verificación
Por cada entrega registrar cambios, pruebas realmente ejecutadas, resultados, riesgos y SHA. Sin pruebas, indicar NO VERIFICADO. La aprobación es por funcionalidad y no por un gate global.
