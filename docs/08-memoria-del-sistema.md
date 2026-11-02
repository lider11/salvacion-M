# Memoria canónica — Salvación M

## 2026-11-02 — Reinicio controlado

**Decisión:** crear una línea de trabajo limpia en `reinicio-2026-desde-cero` preservando `main` y su historial.

**Motivo:** retirar el código, configuraciones y artefactos operativos heredados para reconstruir por fases con verificación.

**Cambio:** primer commit de limpieza con solo `README.md`, `AGENTS.md`, `docs/08-memoria-del-sistema.md`, `docs/arquitectura-inicial.md` y `.gitignore`.

**Restricciones:** no modificar producción ni `main`; GitHub solo es fuente e historial. No hay secretos ni destinatarios configurados.

**Validación prevista:** verificar SHA, contenido exacto del árbol y rama de destino tras el commit.

**Pendientes:** diseño funcional; frontend accesible; API y D1; CRM; seguridad; pruebas; Sites QA; scheduler; recordatorios e idempotencia; auditoría G3.

**Estado:** `G3_PASS = FALSE`; 0/7 criterios acreditados para la nueva base. La creación del commit no equivale a despliegue.
