# AGENTS.md — Salvación M

## Antes de implementar
Leer `README.md` y `docs/08-memoria-del-sistema.md`. Revisar el código afectado y anotar riesgos breves antes de cambiar.

## Método
INSPECCIONAR → DISEÑAR → IMPLEMENTAR → PROBAR → DOCUMENTAR.

Corregir defectos relevantes y volver a probar lo afectado. Preferir entregas pequeñas. No usar puertas de aprobación acumulativas, certificaciones artificiales ni SDD extensos que bloqueen el avance.

## Restricciones
- Frontend: HTML5, CSS3 y JavaScript Vanilla. No introducir frameworks sin autorización.
- Backend previsto: Node.js LTS + Express. No frameworks adicionales sin autorización.
- GitHub solo para código, docs e historial. No usar GitHub Actions como scheduler ni despliegue operativo.
- No tocar producción sin autorización expresa.
- No registrar secretos, datos personales reales ni información de salud en el repositorio.
- Persistir solicitudes antes de afirmar éxito.
- Separar portal público, CRM y servicios internos.
- Autenticación, RBAC, CSRF, controles contra XSS e inyección SQL, auditoría y mínimo privilegio cuando exista backend.
- Objetivo de accesibilidad: WCAG 2.2 AA.

## Verificación
Por entrega: qué cambió, qué se probó, resultado, riesgos y SHA. Sin prueba real: indicar NO VERIFICADO. La calidad se acredita por funcionalidad, no por un gate global.
