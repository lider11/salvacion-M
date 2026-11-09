# Salvación M — Arquitectura de backend Node.js + Express
Fecha: 2026-11-08 | Estado: DECISIÓN ARQUITECTÓNICA; IMPLEMENTACIÓN PENDIENTE

## Objetivo y alcance
Backend independiente de Sites para portal de orientación en salud, recepción de solicitudes, CRM, citas, notificaciones y recordatorios. Frontend existente en HTML5, CSS3 y JavaScript Vanilla. El backend será un **monolito modular** Node.js LTS + Express, con endpoints HTTP JSON sobre HTTPS. No se habilita producción con este documento.

## Diagrama lógico
```text
Portal público (HTML/CSS/JS) -------+
                                    +-- HTTPS --> Express /api/v1
CRM privado (HTML/CSS/JS) ----------+                |
                                             Middlewares de seguridad
                                                      |
                                 +--------------------+------------------+
                                 |                    |                  |
                        Servicios de dominio    Repositorios       Auditoría
                         clientes/solicitudes     transaccionales      eventos
                            citas/CRM                  |
                                                       BD
                                 |
                        Adaptador de notificaciones
                        Job programado Node.js --> reservas idempotentes en BD
```

## Decisiones arquitectónicas
- Node.js LTS y Express autorizados para el backend; no introducir frameworks adicionales sin necesidad y autorización.
- Separar controladores HTTP, lógica de dominio y repositorios; no poner consultas SQL ni secretos en frontend.
- CRM independiente en interfaz y permisos, pero compartiendo API y fuente de datos.
- GitHub solo código, documentación y trazabilidad; no usar GitHub Actions como scheduler ni despliegue operativo.
- Sitio y CRM solo confirmarán recepción después de persistencia transaccional real.
- Jobs autónomos Node.js en proceso programado externo al ciclo de solicitudes; registrar ejecuciones y no depender de peticiones de usuarios.
- Sitio público sin pasarela de pagos en la fase inicial; consulta inicial gratuita.

## Estructura objetivo — no constituye implementación
```text
frontend/public/
frontend/crm/
backend/
  src/app.js
  src/server.js
  src/config/
  src/routes/
  src/controllers/
  src/services/
  src/repositories/
  src/middleware/
  src/validators/
  src/jobs/
  src/integrations/
  migrations/
  tests/
  package.json
docs/backend/
```

## Responsabilidades
- routes/controllers: contrato HTTP y respuestas normalizadas.
- validators: listas permitidas de campos, tipos, longitud, formatos y límites.
- services: reglas de negocio y transiciones válidas.
- repositories: SQL parametrizado, transacciones, paginación.
- middleware: sesiones, RBAC, CSRF, límites de peticiones, errores, requestId.
- jobs: elegibilidad, reserva atómica, envío, reconciliación y reintentos.
- integrations: proveedores externos bajo interfaces sustituibles.
- auditoría: eventos estructurados sin datos sensibles innecesarios.

## Base de datos: decisión condicionada
Inventariar D1 y las migraciones existentes. **No asumir** que SQLite local equivale a D1 ni migrar automáticamente. SQLite con almacenamiento persistente y copias de seguridad puede servir para una instancia única. PostgreSQL es preferible cuando se requiera escalamiento horizontal o mayor concurrencia. Definir motor después de seleccionar hosting y comprobar integridad, backups y recuperación. Ninguna tabla propuesta se declara existente.

## Hosting
Por definir: proveedor Node.js con HTTPS, secretos gestionados, almacenamiento persistente o BD administrada, scheduler gestionado, logs y backups. Se excluye Sites como runtime. Separar desarrollo, QA y producción; prohibido cambiar producción sin autorización expresa.

## Entrega
Primera funcionalidad verificable: formulario público → API Express → persistencia → solicitud visible en CRM con permisos. Después auth avanzada, citas y recordatorios. La existencia de esta especificación no equivale a código implementado ni operación validada.
