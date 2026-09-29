# Evidencia G3 — identidad individual en QA

Fecha: 2026-09-24  
Gate: G3  
Requisito: `INDIVIDUAL_ACTOR_IDENTITY`

## Corrección

El backend QA reconoce la identidad verificada por Sites que transmite el CRM privado mediante `x-crm-actor-id` y aplica el rol administrativo validado por el proxy. El actor ya no queda registrado como `legacy-service-admin` cuando la solicitud procede del CRM configurado.

Mapeo vigente:

- `ADMIN` → `admin`;
- `ASESOR` → `lawyer`;
- `LECTURA` → `reader`.

Las identidades declaradas directamente en `CRM_IDENTITIES` mantienen prioridad y no pueden ser sustituidas por headers del cliente.

## Validación

- Suite QA posterior al build: `24/24 PASS`.
- Prueba nueva: el proxy CRM atribuye `site-user-77`, informa modo `individual` y conserva el rol `ASESOR`.
- Las pruebas preexistentes confirman rechazo anónimo, rechazo de usuarios desconocidos, solo lectura y resistencia a la falsificación del actor.
- Despliegue QA: `appgdep_6ab53828385481919ce0d6048741fdf1`.
- Versión: `appgprj_6ab1f0bab8e88191a82ba8acd54d9a40~appgver_8d30ef5aed3c8191824fc9d6a1f93fb9`.
- Commit Sites: `34719b3a10bfcc2f09c78a2c6d8ba8c31d63bca9`.

## Resultado

La implementación y el despliegue QA quedan verificados. El modo heredado permanece únicamente como compatibilidad temporal para consumidores que no transmiten identidad, por lo que su eliminación se registra como riesgo residual de endurecimiento y no debe utilizarse como evidencia de una actuación individual.
