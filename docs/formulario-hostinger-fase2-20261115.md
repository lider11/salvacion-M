# Integración de formulario — 15/11/2026

Objetivo: preparar frontend para API PHP Hostinger, sin habilitar captación.
Base inspeccionada: `3d6e7833040583851d23531050599fa932573675`.
Rama: `feat/formulario-hostinger-staging-20261115`.

## Implementación

- Aplicador del kit ejecutado en clon independiente Linux; respaldo externo creado.
- `index.html`: carga diferida del nuevo módulo; conserva vista previa y envío oculto/deshabilitado.
- `js/main.js`: retiro del controlador heredado; controlador preview exclusivo para ese modo.
- `js/formulario-api.js`: contrato JSON, seis categorías, privacidad explícita, HTTP 201 + UUID v4 para confirmar, sin reintentos automáticos.
- `css/style.css`: confirmación accesible del servidor.
- `tests/formulario.test.cjs`: suite ampliada de 5 a 13 pruebas con fetch simulado en VM. No es servidor HTTP ni navegador real.

## Pruebas y crítica adversarial

Sintaxis de ambos JS PASS; Node 13/13 PASS; aplicador Python 1/1 PASS; diff sin errores PASS.
Ronda 1: detectada ciudad formada solo por signos aceptada por JS y rechazada por PHP; corregido requisito de al menos una letra y añadida regresión.
Ronda 2: doble clic pendiente, red ambigua, JSON inválido, UUID inválido, 200 inesperado, 429 y 500 bloquean reenvíos; 422 permite corrección explícita sin repetición automática. Pruebas PASS.
Comparación de contrato con API H03 del adjunto: campos, categorías y estados compatibles por lectura; backend sin modificar.
No se declara idempotencia persistente: bloqueo por instancia de página, no cubre recarga, otras pestañas ni repetición directa de API.
PHP no instalado: lint PHP y suite backend NOT_RUN; no se cambió PHP.
`gauntlet-loop-2026/SKILL.md` no presente en paquetes/repositorio; se aplicó el ciclo de inspección, pruebas y crítica descrito por la orden actual, sin restaurar G3.

## Verificación real y bloqueos

Staging abierto en navegador remoto: título y encabezado «Próximamente», marca Hostinger. Frontend Salvación M no publicado en la raíz observada.
Hostinger restringe el inicio de sesión desde este navegador en la nube. No se accedió a rutas privadas, backups ni archivos del alojamiento; no se solicitó takeover al estar restringido por el proveedor.
Previsualización localhost del clon en navegador remoto falló con ERR_CONNECTION_REFUSED; revisión visual escritorio/móvil y teclado NOT_RUN. No se acredita WCAG integral.
Entorno de equipo disponible Linux, sin VS Code ni unidad C: del portátil. No se inspeccionó su estado Git, migrate.php, stash o respaldos y no se tocó ese checkout.
PR #20 consultado: borrador, abierto, no fusionado; HEAD `18ce0ed0477c8225d850beb8389d49c405c23caa`. Sus resultados históricos no se presentan como reejecutados.
Cero POST reales de esta ejecución. Sin cambios de MySQL, H03, configuración privada o producción. No se reabre diagnóstico de proxy.

## Publicación controlada y reversión (preparadas, no ejecutadas)

Solo frontend: index.html, privacidad.html, css/, js/, assets/ y recursos locales referenciados. Excluir api/, backend/, private/, tests/, work/, output/ y respaldos.
Antes de subir: comprobar webroot real y reglas DirectoryIndex; inventariar colisiones; respaldar fuera de public_html los archivos que se sustituirán, registrar hashes y permisos. Verificar específicamente default.php: no sustituirlo ni borrarlo sin resolver prioridad del índice.
Tras disponer de rutas y backup verificados: publicar vista previa, comprobar recursos, móvil, escritorio, teclado y ausencia de POST. Ante fallo, restaurar solo los archivos frontend respaldados y retirar exclusivamente los nuevos archivos del manifiesto. No ejecutar migraciones ni restaurar BD.
No hay backup remoto ni rollback ejecutable validado en esta sesión: despliegue BLOCKED.

| Decisión | Booleano | Estado |
| --- | --- | --- |
| Integración en código preparada | TRUE | PASS |
| Pruebas locales del alcance | TRUE | PASS |
| Envío público desactivado | TRUE | PASS |
| Frontend publicado en Hostinger por esta ejecución | FALSE | BLOCKED |
| Funcionamiento visual real del formulario | FALSE | NOT_RUN |
| Persistencia real del formulario verificada | FALSE | NOT_RUN |
| Aprobación jurídica acreditada | FALSE | NO_ACREDITADO |

Estado final técnico: código probado localmente, entrega para revisión; Hostinger pendiente. SHA final y PR se registran en el historial Git y respuesta de entrega; no se inventa un SHA autorreferente en este documento.
