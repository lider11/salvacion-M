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
