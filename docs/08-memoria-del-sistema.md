# Memoria canónica — Salvación M

## 2026-11-02 — Reinicio controlado

**Decisión:** crear una línea de trabajo limpia en `reinicio-2026-desde-cero` preservando `main` y su historial.

**Motivo:** retirar el código, configuraciones y artefactos operativos heredados para reconstruir por fases con verificación.

**Cambio:** primer commit de limpieza con solo `README.md`, `AGENTS.md`, `docs/08-memoria-del-sistema.md`, `docs/arquitectura-inicial.md` y `.gitignore`.

**Restricciones:** no modificar producción ni `main`; GitHub solo es fuente e historial. No hay secretos ni destinatarios configurados.

**Validación prevista:** verificar SHA, contenido exacto del árbol y rama de destino tras el commit.

**Pendientes:** diseño funcional; frontend accesible; API y D1; CRM; seguridad; pruebas; Sites QA; scheduler; recordatorios e idempotencia; auditoría G3.

**Estado:** `G3_PASS = FALSE`; 0/7 criterios acreditados para la nueva base. La creación del commit no equivale a despliegue.

## 2026-11-02 — ADN v2.0 e identidad institucional premium

**Decisión aprobada por el responsable:** adoptar la dirección visual Institucional premium (azul marino, blanco y acentos dorados discretos).

**Implementación documental:** se añadieron `docs/ADN-MAESTRO-V2.md` y `docs/SISTEMA-DISENO-V2.md` con propósito, audiencias, mensajes, recorrido, tokens, componentes, reglas de accesibilidad, seguridad y criterios de aceptación.

**Alcance:** solo documentación en `reinicio-2026-desde-cero`; no se modificaron `main` ni producción, ni se implementó el sitio.

**Verificación pendiente:** comprobar archivos y commits en GitHub; evaluar contrastes, interfaz, QA y accesibilidad al construir el frontend.

**Estado:** `ADN_DOCUMENTADO = TRUE`; `DESIGN_SPEC = TRUE`; `IMPLEMENTACION_WEB = FALSE`; `G3_PASS = FALSE`.
