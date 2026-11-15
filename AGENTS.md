# AGENTS.md — Salvación M

## Antes de implementar

Leer `README.md` y `docs/08-memoria-del-sistema.md`. Revisar el código afectado y anotar riesgos breves antes de cambiar.

## Método

INSPECCIONAR → PLANIFICAR → IMPLEMENTAR → PROBAR → DOCUMENTAR.

Corregir defectos relevantes y volver a probar lo afectado. Preferir entregas pequeñas. No usar puertas de aprobación acumulativas, certificaciones artificiales ni SDD extensos que bloqueen el avance.


## Decisión vigente: G3 y SDD extenso retirados (2026-11-15)

Por instrucción expresa del titular, **G3 queda deshabilitado como gate global de Salvación M**. No exigir la matriz G3 de siete criterios, `G3_PASS`, `READY_FOR_VERIFICATION` ni las ceremonias o entregables acumulativos del SDD como condición para desarrollar, probar o entregar funcionalidades. Las referencias a G3/SDD en ramas, memorias y proyectos QA anteriores son **históricas**, no instrucciones activas de la línea `main`. No eliminar ese historial.

Cada entrega tendrá criterios funcionales proporcionales a su alcance, pruebas pertinentes y evidencia verificable. Se mantienen la autorización para desplegar, la privacidad y protección de datos, el control de acceso cuando aplique, las validaciones de seguridad, la accesibilidad y la prohibición de afirmar éxito sin persistencia real. El retiro de G3 **no activa** formularios, CRM, scheduler ni recordatorios y tampoco autoriza cambios de producción.

## Restricciones

- Frontend: HTML5, CSS3 y JavaScript Vanilla. No introducir frameworks sin autorización.
- Backend autorizado: PHP 8.2+ con PDO y MySQL para compatibilidad con Hostinger; no introducir frameworks sin autorización.
- GitHub solo para código, docs e historial. No usar GitHub Actions como scheduler ni despliegue operativo.
- No tocar producción sin autorización expresa.
- No registrar secretos, datos personales reales ni información de salud en el repositorio.
- Persistir solicitudes antes de afirmar éxito.
- Hostinger es alojamiento previsto, no despliegue acreditado. MySQL compatible en servidor; SQLite solo en pruebas locales.
- Separar portal público, API y futuro CRM administrativo. Sites QA históricos son sistemas separados: no sincronizar ni migrar sus bases sin decisión expresa.
- Mantener `accept_requests` desactivado y el frontend en vista previa hasta aprobación de privacidad, configuración segura y pruebas de staging.
- Autenticación, RBAC, CSRF, controles contra XSS e inyección SQL, auditoría y mínimo privilegio cuando exista backend.
- Objetivo de accesibilidad: WCAG 2.2 AA.

## Verificación

Por entrega: qué cambió, qué se probó, resultado, riesgos y SHA. Sin prueba real: indicar NO VERIFICADO. La calidad se acredita por funcionalidad, no por un gate global.
