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
