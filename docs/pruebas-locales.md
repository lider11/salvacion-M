# Formulario local con persistencia

Usar solo datos ficticios. No habilita produccion ni implica aprobacion del aviso.

## Iniciar

En PowerShell, desde la raiz del proyecto:

```powershell
.\iniciar-local.ps1
```

Abre http://127.0.0.1:8088/#contacto. Usa exactamente esa direccion (no Live Server, file:// ni localhost). El boton **Enviar prueba local** guarda mediante la misma API PHP que se preparara para Hostinger. Cierra con Ctrl+C. Para otro puerto: `.\iniciar-local.ps1 -Port 8090`.

Alternativa directa:

```powershell
& C:\xampp\php\php.exe backend/serve-local.php
```

Se requieren PHP 8.2+, PDO SQLite y mbstring. No requiere MySQL, paquetes nuevos ni credenciales. El launcher busca PHP en PATH y despues en XAMPP.

## Comprobar el resultado

1. Completa campos con datos inventados, elige un servicio y marca la confirmacion de prueba.
2. Pulsa Enviar prueba local. Solo se muestra confirmacion cuando la API devuelve 201, ok true e identificador UUID valido despues del commit.
3. Revisa los ultimos veinte registros desde otra terminal:

```powershell
& C:\xampp\php\php.exe backend/local-requests.php
```

El identificador debe coincidir. Esto no manda correos, mensajes ni notificaciones.

La consola del servidor indica la ubicacion exacta de SQLite. Base y configuracion quedan en una carpeta `salvacion-local-<identificador>` dentro del directorio temporal de Windows, fuera del proyecto y del webroot. Se conservan al reiniciar, pero Windows puede limpiar temporales; no es almacenamiento para datos reales. Para reiniciar las pruebas desde cero, detén el servidor y elimina exclusivamente esa carpeta indicada en consola.

## Separacion del sitio publico

El HTML del repositorio conserva vista previa. Solo el router local, ligado a 127.0.0.1 y habilitado por el launcher, inyecta la version ficticia `local-ficticio-v1`. La API admite el origen exacto y limita a cinco solicitudes por correo por hora UTC. Las ventanas se reinician al cambiar la hora, no una hora despues de cada envio.

El servidor local sirve unicamente las paginas, recursos estaticos permitidos y /api/requests.php. Bloquea backend, tests, .git y configuracion. No subir los scripts locales a Hostinger; usar la distribucion de docs/backend-hostinger.md.

Ante red interrumpida, timeout o respuesta invalida, el resultado puede ser incierto: revisar por terminal antes de repetir. No hay reintentos automaticos ni garantia de idempotencia entre envios separados.

## Pruebas repetibles

```powershell
& C:\xampp\php\php.exe tests/php-api-smoke.php
# Con el servidor local activo y Playwright ya disponible:
node tests/local-form-smoke.cjs
```

La primera suite usa SQLite temporal aislado. La segunda usa Chromium, verifica una fila real en la base local, fuerza un fallo transaccional para un correo ficticio y elimina el trigger al terminar. Conserva los registros sinteticos creados. No ejecutar contra un servidor compartido ni produccion. PHP_BINARY permite elegir PHP para el test Node; LOCAL_ORIGIN permite cambiar el puerto local.

La configuracion de pruebas no sustituye la futura aprobacion del aviso y su version de produccion. MySQL/Hostinger se verificaran en una entrega posterior.
