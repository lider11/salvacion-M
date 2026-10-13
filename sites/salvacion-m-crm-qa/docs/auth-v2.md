# Auth v2 — Vanilla JavaScript

## Fronteras
1. Sites private access: infraestructura QA, independiente.
2. CRM Auth v2: identidad humana, sesión opaca en D1 y cookie HttpOnly.
3. Scheduler G3: M2M con REMINDER_TRIGGER_TOKEN; no reutiliza sesiones humanas.

## Contrato
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout
- Cookie: __Host-sm_session; Secure; HttpOnly; SameSite=Strict; Path=/
- CSRF: token de sesión requerido en mutaciones.
- Roles: ADMIN, ASESOR, LECTURA.
- Password: PBKDF2-SHA-256, salt aleatorio, iteraciones configurables >=210000.
- Sesión: 30 min de inactividad, 8 h absolutas.
- El navegador nunca recibe ADMIN_API_TOKEN, BACKEND_SITE_AUTH_TOKEN ni REMINDER_TRIGGER_TOKEN.


## Mapa correcto de rutas

- Navegador -> CRM QA:
  - POST /api/auth/login
  - GET /api/auth/me
  - POST /api/auth/logout
- CRM QA -> Gates QA, server-to-server:
  - POST /api/internal/auth/bootstrap-admin
  - POST /api/internal/auth/login
  - GET /api/internal/auth/me
  - POST /api/internal/auth/logout

Las rutas internas de Gates requieren CRM_AUTH_SERVICE_TOKEN y no sustituyen las rutas públicas del CRM.

## Bootstrap del primer ADMIN

El primer ADMIN se crea una sola vez mediante POST /api/internal/auth/bootstrap-admin desde un cliente de servicio autorizado. El Worker de Gates:
- exige CRM_AUTH_SERVICE_TOKEN;
- valida correo y contraseña (mínimo 14 caracteres);
- genera una sal aleatoria;
- calcula PBKDF2-SHA-256 con 210000 iteraciones;
- inserta únicamente si crm_users está vacío;
- devuelve sólo id, email y role;
- nunca devuelve contraseña, hash ni sal;
- rechaza intentos posteriores con 409.
