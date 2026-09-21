# Arquitectura del frontend

## Objetivo

Definir una estructura simple, mantenible y lista para evolucionar hacia integración con backend y CRM.

## Stack recomendado

- React.
- Vite.
- TypeScript.
- React Router.
- CSS Modules, Tailwind o sistema equivalente, evitando estilos globales descontrolados.
- React Hook Form + Zod para formularios.
- Fetch o cliente HTTP liviano para API.

## Estructura sugerida

```
src/
  app/
    router.tsx
    App.tsx
  components/
    Header/
    Footer/
    Hero/
    ServiceCard/
    ProcessStep/
    ContactForm/
    LegalNotice/
  pages/
    HomePage.tsx
    PrivacyPage.tsx
    TermsPage.tsx
    NotFoundPage.tsx
  features/
    leads/
      api.ts
      schema.ts
      types.ts
  styles/
    tokens.css
    globals.css
  assets/
  main.tsx
```

## Rutas públicas

- `/`
- `/privacidad`
- `/terminos`
- `/cookies`, solo si se implementa consentimiento de cookies.
- `/gracias`, opcional para confirmación posterior al formulario.

## Separación del CRM

El CRM no debe vivir dentro de la misma navegación pública.

Opciones:

- Subdominio: `crm.salvacionm...`
- Aplicación separada.
- Ruta protegida técnicamente desacoplada del frontend público.

Preferencia: aplicación separada o subdominio.

## Reglas de componentes

- Componentes pequeños y reutilizables.
- Sin lógica de negocio compleja dentro de componentes presentacionales.
- Formularios desacoplados de la llamada HTTP.
- Textos del sitio centralizados cuando sea posible.
- No codificar secretos en frontend.
