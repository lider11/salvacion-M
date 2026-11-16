# API PHP para Hostinger

## Estado y alcance

La API inicial de solicitudes está implementada en `api/requests.php`, con utilidades PHP en `backend/` y migraciones MySQL/SQLite. En la rama aislada de Hostinger el frontend incluye `fetch` hacia `/api/requests.php` y el formulario se limita a pruebas sintéticas. Hay indicios históricos de API/MariaDB en Hostinger, pero la versión desplegada y una escritura real del formulario no están reconciliadas ni acreditadas. La privacidad pública sigue pendiente.

La API solo debe recibir solicitudes cuando estén aprobados el aviso de privacidad, la finalidad y retención de datos, el consentimiento y los canales de atención. No usar datos personales reales durante pruebas. No se toca producción desde este trabajo.

## Requisitos

- PHP 8.2 o superior con PDO y `pdo_mysql` habilitado.
- MySQL 8+ (o la versión compatible ofrecida por el plan Hostinger).
- HTTPS activo para el dominio.
- El archivo privado de configuración y las copias de seguridad fuera del directorio web público.

## Estructura sugerida en Hostinger

En el directorio de la cuenta del dominio, fuera de `public_html`:

- `backend/` — `bootstrap.php`, `migrate.php` y migraciones.
- `private/salvacion.php` — configuración y secretos, no subir al repositorio.

Dentro de `public_html`:

- Archivos del portal (`index.html`, `css/`, `js/`, `assets/`, `privacidad.html`).
- `api/requests.php` y `api/.htaccess`.

El endpoint busca primero `backend/bootstrap.php` como carpeta hermana de `public_html`. Para desarrollo local tiene una ruta de respaldo a `backend/` dentro del proyecto. `backend/.htaccess` bloquea el acceso web a los archivos PHP internos si esa carpeta se aloja por error bajo el webroot.

## Preparación de base de datos

1. En hPanel crea una base MySQL y un usuario con contraseña aleatoria.
2. Importa `backend/migrations/mysql.sql` desde phpMyAdmin.
3. Para el usuario runtime, concede solo `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre las tablas `requests` y `request_rate_limits`. No necesita permisos DDL después de importar.
4. Guarda la configuración a partir de `backend/config.example.php` como `private/salvacion.php`, fuera de `public_html` y del repositorio.
5. Sustituye todos los valores `CAMBIAR_*`. Genera `email_hash_key` con al menos 32 bytes aleatorios; por ejemplo, usando un generador criptográfico confiable. No reutilices contraseñas ni claves del repositorio.
6. En staging privado, alinea la clave `privacy_notice_version` con la versión sintética del HTML (`sm-hostinger-sintetico-v1`), sin considerarla una autorización jurídica pública. Configura `allowed_origins` exclusivamente como `['https://darkviolet-hippopotamus-789000.hostingersite.com']` (sin barra final). Solo añade otros orígenes con justificación y verificación explícitas.

La ruta predeterminada de configuración es `private/salvacion.php`, hermana de `backend/`. Puede indicarse otra ruta mediante `SALVACION_CONFIG`. El endpoint permite configurar `SALVACION_BACKEND_BOOTSTRAP` si Hostinger requiere otra ubicación para el código.

## Dominio Hostinger de referencia — 2026-11-16

- Portal: `https://darkviolet-hippopotamus-789000.hostingersite.com/`
- Formulario: `https://darkviolet-hippopotamus-789000.hostingersite.com/#contacto`
- Aviso: `https://darkviolet-hippopotamus-789000.hostingersite.com/privacidad.html`
- API: `https://darkviolet-hippopotamus-789000.hostingersite.com/api/requests.php`
- Origen exacto permitido para el backend: `https://darkviolet-hippopotamus-789000.hostingersite.com`
- Directorio web de referencia según memoria anterior: `/home/u270515629/domains/darkviolet-hippopotamus-789000.hostingersite.com/public_html` (reconfirmar en hPanel).
- `js/formulario-api.js` construye la ruta `/api/requests.php` desde `window.location.origin`; no se usan CORS ni claves en el navegador.
- `index.html` declara `data-site-origin` y bloquea el envío si se sirve en otro hostname, salvo localhost/127.0.0.1 para ensayos locales.
- Mantener `noindex, nofollow` en staging. No instalar archivos de QA en un sitio público sin control de acceso.
- No modificar `private/salvacion.php` a ciegas: comprobar el valor vigente de `allowed_origins` y `privacy_notice_version` con operador autorizado, sin revelar secretos.

## Endpoint

`POST /api/requests.php`

- Acepta exclusivamente JSON y verifica `Origin` contra una lista exacta; no habilita CORS.
- Valida nombre, correo, teléfono opcional, ciudad opcional, una de las seis categorías y descripción de 20–1000 caracteres.
- Requiere `consentimiento: true` y `privacy_version` exactamente igual a la versión configurada.
- Aplica un límite por correo normalizado (5 por hora por defecto, ajustable hasta 30). La tabla de límites guarda solo HMAC del correo, no el correo ni la IP; las ventanas antiguas se eliminan durante solicitudes aceptadas.
- Usa consultas PDO preparadas y límite de cuerpo JSON de 16 KiB.
- Responde `201` con un identificador solo después de confirmar el commit. No devuelve el contenido personal. Un `201` significa guardado, no aceptación del caso ni garantía de resultado.

No hay panel CRM, autenticación de operador, correo, borrado/retención automatizados ni conexión del formulario en esta primera entrega.

## Activación futura del formulario

El código de staging utiliza `data-preview-only="false"` para ensayar el flujo con entradas sintéticas, sin que eso autorice la recepción pública. Para recibir datos reales se exige:

1. aviso y finalidad aprobados jurídicamente;
2. versión de privacidad coordinada entre configuración del servidor y payload;
3. texto de consentimiento aplicable y checkbox funcional, nunca preseleccionado;
4. destino y responsable de tratamiento confirmados;
5. procedimiento de acceso, atención, retención y eliminación de solicitudes;
6. pruebas en staging con información ficticia.

La API no se anuncia como canal disponible antes de completar esos puntos.

## Pruebas locales

Con PHP 8.2+ y extensiones PDO SQLite habilitadas:

- `php -l api/requests.php`
- `php tests/php-api-smoke.php`

El test crea temporalmente un SQLite y un servidor PHP ligado solo a `127.0.0.1`; usa una versión de privacidad ficticia y datos sintéticos, y elimina los archivos temporales al terminar. No requiere instalar paquetes. No prueba la conexión real a MySQL de Hostinger.

Para preparar manualmente SQLite en desarrollo, crea una configuración privada con `dsn` `sqlite:/ruta/fuera-del-webroot/dev.sqlite` y ejecuta `php backend/migrate.php`.

## Riesgos pendientes

- La aprobación jurídica y la política real de conservación están pendientes; almacenar datos personales antes de eso no está autorizado.
- El proveedor debe confirmar versión/extensiones PHP, MySQL, rutas fuera de `public_html`, backups y permisos del plan contratado.
- Antes de aceptar solicitudes reales se necesita una revisión operativa y de seguridad en un entorno de staging; las pruebas locales no certifican producción ni cumplimiento legal.

## Definiciones del responsable — 2026-11-15

- Responsable declarado: Salvación M; identificación legal y canal para derechos pendientes.
- Finalidad indicada: recolectar información de contacto para llamar a la persona interesada en respuesta a su solicitud.
- Revisión de solicitudes: directamente por el responsable del proyecto; no implica que exista CRM, acceso de operador ni notificaciones.
- Conservación y eliminación: el responsable desea decidirlas personalmente. Falta documentar un criterio de necesidad, plazo o evento de cierre y procedimiento de eliminación; no se interpreta como conservación indefinida aprobada.
- El formulario conserva su vista previa. El teléfono sigue opcional: antes de activar un flujo de llamadas se debe resolver esa coherencia con los campos y la validación.
