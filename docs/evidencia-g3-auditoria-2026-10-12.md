# G3 — auditoría y corrección de CI — 12 de octubre de 2026

G3_STATUS = READY_FOR_VERIFICATION. No release candidate congelado.
Actuación parcial detenida antes de pruebas finales por limitación operativa del conector GitHub: no expone gestión de secretos de Actions ni workflow_dispatch. No equivale a fallo demostrado de la credencial vigente.

## Fuente actual observada
- MAIN_HEAD: 8d4fda70ea65a3eb208352c272dc681059d88fdf.
- PR5_HEAD: 70c3d30e00c73de3f2e6398bb011d1513520326d.
- PR6_HEAD inicial: 7b83a720e3e15fcf3be1c609856208d1eba993e5.
- Corrección ejecutable: 6492d1d1a29403817de0e3a24ebd2e92ad61b403, rama auth-v2-vanilla-js.
- PR #5 y #6 abiertos; sin merge.

## Auditoría inicial

| Requisito | Estado | Evidencia | Bloqueo | Acción |
|---|---|---|---|---|
| Formulario → CRM | NO VERIFICADO EN RC | Documentos históricos; suite local | Sin RC | Repetir E2E en RC |
| Consulta → cita | NO VERIFICADO EN RC | Documentos históricos; suite local | Sin RC | Repetir E2E |
| Agenda | NO VERIFICADO EN RC | Revisión histórica v10 | Sin RC | Inspección viva |
| Disponibilidad | NO VERIFICADO EN RC | Evidencia 24/09 | Sin RC | Verificar persistencia |
| Roles | TESTED LOCAL | Gates/CRM tests | QA no probado | E2E LECTURA 403 |
| Auditoría | IMPLEMENTED / TESTED LOCAL | activities y tests | Correlación final ausente | Inspeccionar eventos reales |
| Recordatorios | NO CUMPLE | Ventana exclusiva +23/+25h | Llegadas tardías perdidas | Modelo now < scheduled_at <= now+24h |
| Brevo | HISTÓRICO | Evidencia 23/09 | Otro SHA | Nuevo recibo y entrega |
| WhatsApp | HISTÓRICO | Evidencia 24/09 | Otro SHA | Verificar alcance requerido |
| Scheduler | NO VERIFICADO | Workflow horario en main | Sin dispatch operativo | auth_only real |
| Sites privado | ACCESO PRIVADO OBSERVADO | get_site propietario, custom sin otros usuarios | Scheduler no probado | No ampliar audiencia |
| Idempotencia | TESTED LOCAL | UNIQUE y INSERT OR IGNORE | Concurrencia viva ausente | Doble scheduler y D1 |
| Monitor G3 | IMPLEMENTED | Código y pruebas | UI final sin inspección | Revisar RC |
| Visual | NO VERIFICADO EN RC | Evidencia histórica desktop | Mobile/keyboard pendientes | Auditoría viva |
| CI | FALLO HISTÓRICO CORREGIDO LOCALMENTE | Run 37068908953; build y validate locales | Nuevo run por comprobar | Run 38263902763 |
| GitHub ↔ Sites | NO RECONCILIADO | SHAs separados observados | Comparación por archivo no ejecutada | Abrir source y comparar |
| Deployments | DEPLOYED HISTÓRICO | Estado succeeded de v17/v11 | No RC | Deploy tras reconciliación y CI |
| Memoria | ACTUALIZACIÓN PARCIAL | Esta auditoría | Cierre real pendiente | Registrar cadena final |

## Corrección realizada
SyntaxError reproducido en worker/runtime.js línea 81: objeto de respuesta 409 mal cerrado.
Corregido en GitHub, sin cambios en producción, D1, secretos ni deployments.
Gates QA: npm ci, build, validate y tests: 43/43 PASS.
CRM QA: build, validate y tests: 14/14 PASS.
Los proveedores de los tests son simulados; no acreditan triggers reales.

## Sites y D1 observados
- Gates QA v17, source 0bb2e15235a3ac0eb580cd95ff05e8e745b0e02f.
- Deployment appgdep_6ac023affafc8191adef62a259c363b9: succeeded; env revision 19.
- CRM QA v11, source 76fa817059744616423bbc79dd190565a68565d9.
- Deployment appgdep_6ac01c58427c8191a69a479cb6aa0e0f: succeeded; env revision 5.
- D1 binding DB: tablas de CRM, agenda, reminders y Auth v2 presentes.
- appointment_reminders: 0 filas, has_more=false.
- No lectura de hashes/salts/sesiones ni datos de pacientes.
- Estas versiones NO se declaran reconciliadas con el PR ni con un RC.

## Brechas adicionales observadas
- PBKDF2 verifica exclusivamente 210000; falta política 600000 y migración tras login.
- crm_users no declara password_algorithm.
- Timeout ambiguo actualmente se registra como provider_connection_error/failed, sin unknown_requires_review.
- Persistencia del provider_message_id observada en activities, no columna de reminder.
- Workflow usa npm install en raíz, Actions por tags y Node major 24; falta endurecimiento exigido.
- CRM QA no tiene package-lock.json versionado.
- No se realizó matriz de hashes GitHub/Sites, manifest de artefactos, ni supply-chain review integral.

## Bloqueo y continuación
Bloqueo: no se puede ejecutar ni reparar el scheduler real con las operaciones GitHub disponibles.
Causa: no hay herramientas para guardar secrets de environment qa o lanzar workflow_dispatch; no hay gh instalado con sesión utilizable.
Acción mínima del usuario: en GitHub Actions ejecutar QA appointment reminders en main con auth_only=true y aportar URL del run. Si responde 401, guardar mediante interfaz segura SITES_QA_AUTHORIZATION vigente exclusivo de Gates QA y repetir. No copiar secretos al chat.
Punto exacto: FASE E/F, scheduler → autenticación privada → GET /api/health. No POST ni cita sintética antes de SCHEDULER_SITE_AUTH PASS.
Tras health PASS, completar resiliencia/unknown, Auth, CI reproducible, congelar RC, reconciliar y desplegar QA antes de los dos disparos.
La congelación debe hacerse después del último cambio ejecutable: fases G/H posteriores a una congelación preliminar la invalidarían.

## Criterios canónicos
Scheduler, Recipient, First trigger, Second trigger, Delivery, Visual, Documentation: PENDING para el nuevo RC.
G3_CRITERIA: 0/7 acreditados para el release final; no se invalida la evidencia histórica dentro de su alcance.
No hubo envío real, RC final, provider message ID nuevo, delivery, revisión final ni transición PASS.


## Resultado CI observado — 12 de octubre de 2026

Run https://github.com/lider11/salvacion-M/actions/runs/38263902763, commit ejecutable 6492d1d1a29403817de0e3a24ebd2e92ad61b403: SUCCESS, job 114861096115 completo. HTML/CSS/JS, Pa11y, axe/Playwright, build/tests público, build/validate/tests Gates y CRM: success. Los commits documentales posteriores no modifican el código ejecutable. Este resultado acredita el workflow existente, no el cumplimiento de todas las exigencias nuevas de CI (npm ci general, lockfile CRM, pin SHA, QA browser integral/provenance). No sustituye pruebas reales ni habilita G3 PASS.
