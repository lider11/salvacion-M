# Flujo de verificación G3


## 28 de septiembre de 2026 — flujo interactivo de verificación G3

- HTML semántico, CSS responsive y JavaScript sin dependencias: pestaña Flujo G3 con selección de cita, ocho pasos navegables, condiciones sí/no, progreso y acción correctiva.
- Endpoint GET/POST /api/admin/g3/verification: cálculo de requisitos en servidor y evidencia documental append-only en activities, sin cambios de esquema o migraciones.
- Roles: consulta para lectores; escritura solo para administrador identificado. No se acepta administración heredada para evidencias. Proxy exige Origin coincidente para POST.
- Registro documental incluye URL HTTPS sin credenciales/parámetros/fragmentos, identidad y fecha; no se consultan URLs del usuario desde el servidor. No se almacenan secretos ni datos clínicos.
- Control optimista de concurrencia y request_id idempotente para reintentos. Validación en servidor, límites de entrada y render mediante textContent.
- Primer/segundo disparo y messageId se contrastan con D1. Evidencias del scheduler, destinatario, entrega, interfaz y reconciliación se identifican explícitamente como revisiones humanas.
- Una decisión de revisión solo se registra cuando los siete criterios tienen soporte. No cambia el gate canónico de GitHub: estados READY_FOR_VERIFICATION → READY_FOR_REVIEW → REVIEW_RECORDED. Cualquier nueva evidencia invalida la revisión anterior; los SHA de revisión visual y documentación deben coincidir.
- Exportación JSON del expediente; no se usa localStorage como fuente de verdad. Las credenciales y el envío siguen en servidor/scheduler; el frontend no dispara recordatorios.
- Validación: build y validate PASS en ambos proyectos; 33 pruebas backend y 9 CRM aprobadas. Casos de permisos, CSRF, reintento, conflicto, URLs inválidas, cierre prematuro, correlación y revisión invalidada. Envíos simulados, sin comunicación real.
- Referencias consultadas el 28-09-2026: WCAG 2.2 (https://www.w3.org/TR/WCAG22/) y OWASP ASVS 5.0.0 (https://owasp.org/www-project-application-security-verification-standard/). Se aplican controles concretos; no se declara certificación WCAG/ASVS integral.
- Pendiente: revisión visual real en navegador (Workers sin preview compatible), ejecución del scheduler y evidencia real de entrega. G3 conserva READY_FOR_VERIFICATION.

Despliegues verificados: backend QA v12, SHA f5f760c03d8bc6cfbe593f73b9ef7f4cf2eaeaae, deployment appgdep_6abad61aedf48191b0c0d95cfe75be91; CRM QA v10, SHA a8ca6b33a4a71d6a56191f1f38736ebc6118433c, deployment appgdep_6abad63611ec819192fec74f682bd029. Ambos SUCCEEDED. Variables revisiones 18 y 4 conservadas.
