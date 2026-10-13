# Scheduler QA autenticado — expediente en curso

GitHub sigue como fuente del código. Sites aloja Workers QA y puede vincular una tarea cloud. No se declara compatibilidad completa antes de comprobar identidad y ejecución en una tarea real.

## Implementación

Endpoint `/mcp` bajo acceso privado: descubrimiento de herramientas, `scheduler_status` de lectura y `dispatch_appointment_reminders` con identidad de operador verificada por Sites, habilitación explícita y request_id UUID persistido. El token M2M anterior no se elimina. Ninguna credencial en frontend/Git.

La reserva de ejecución existe antes de invocar el proveedor. Una reserva started o unknown_requires_review nunca se repite; el mismo ID consulta el estado anterior. Las reservas por cita originales siguen evitando duplicados con distintos IDs de ejecución.

Migración 0008 aditiva; sin DROP/DELETE ni modificaciones de credenciales. Últimas20 ejecuciones visibles por endpoint CRM autenticado, con RBAC existente. Configurado y habilitado no equivalen a ejecución autónoma acreditada.

## Gauntlet iteración1

- Construcción: bridge MCP, persistencia de runs, panel y árbitro booleano.
- Crítica1: monitor no toleraba el adaptador SQLite; corregido antes de publicar.
- Pruebas: Gates57/57; CRM15/15; decisiones7/7, todas locales. No aceptación/entrega real.
- Crítica2: flag enabled podría confundirse con tarea configurada. UI se rotula Habilitado; ninguna variable de acreditación se deriva del flag.
- Credenciales del scheduler GitHub no transferidas ni rotadas. HTTP401 histórico conservado.

## Dependencias antes de activar

1. Despliegue QA y migración aditiva verificadas.
2. Plugin MCP instalado/conectado y llamada real de lectura con identidad del operador.
3. Verificar que la futura tarea recupera el writer y la autorización sin navegador.
4. Habilitar dispatch únicamente después de esa verificación; comprobar cita sintética controlada.
5. Dos disparos, D1, proveedor y entrega correlacionada del mismo RC.

G3_PASS=false; ningún criterio nuevo acreditado por esta implementación.

## Resultado verificado — 12 de octubre, 22:16 Bogotá

RC ejecutable `4cb25c2a2695bd203068f3eae76788174b5a746c`; CI QA38340517234 y frontend38340517246 SUCCESS. Gatesv22 source813a2c243f8c0f2c7ee0f969d63e7f51090b3e33 deploymentappgdep_6acda19c34e08191a812c68740d29694 env22; CRMv15 source9a5f910e3b53e4e5bd5c727fb92a7a67b6c32b0e deploymentappgdep_6acda089f27c819184db4a15799fe050 env9. Ambos succeeded;49 archivos fuente coincidentes. Tabla scheduler_runs presente y vacía; appointment_reminders vacío.

Gates health200; MCP token sin OAuth401; CRM sin sesión401 en el despliegue final. Esto prueba denegación, no autenticación positiva. Plugin instalado según confirmación del propietario22:11; funciones no expuestas en ALL_TOOLS ni tools de este turno. No se repite instalación. Consultar scheduler_status en la siguiente sesión con herramientas actualizadas.

Workflow QA appointment reminders deshabilitado por UI, reversible, conserva69 runs y toda la evidencia. Los CI permanecen habilitados; GitHub no programa recordatorios. Nuevo scheduler Sites sin task creada y SCHEDULER_ENABLED=false. Cero envíos.

Crítica2 detectó RPC null/array que debía devolver400; corregida y8/8 nuevos tests scheduler más7/7 motor booleano aprobados; CI final incluye tests del árbitro. Dos iteraciones correctivas; no agotamiento convertido en PASS.

G3_PASS=false, READY_FOR_VERIFICATION,3/7:CI/reconciliación/documentación. El ADMIN previo es evidencia histórica y no prueba E2E del nuevo panel. Reports: g3-scheduler-report-2026-10-12.json, g3-scheduler-iterations-2026-10-12.json.
