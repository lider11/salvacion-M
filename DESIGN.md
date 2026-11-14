---
name: Salvación M
description: Orientación clara y serena para el acceso a la salud en Colombia
colors:
  navy: "#102A43"
  navy-dark: "#091C2D"
  blue: "#145B82"
  teal: "#086C72"
  gold: "#926B28"
  gold-bright: "#F0C35B"
  ink: "#243342"
  muted: "#526171"
  soft: "#FAF8F4"
  line: "#D8DEE5"
  focus: "#1B65A5"
  nav-hover: "#FFDA85"
  danger: "#8B1E1E"
  white: "#FFFFFF"
  ok-bg: "#E8F5EE"
  warn-bg: "#FFF4D6"
  danger-bg: "#FDECEC"
typography:
  display:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 750
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "0.35rem"
  md: "0.5rem"
  btn: "0.55rem"
  lg: "0.8rem"
  xl: "1rem"
  "2xl": "1.25rem"
  full: "9999px"
spacing:
  xs: "0.35rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "clamp(3rem, 6vw, 5.5rem)"
  container: "min(100% - 2rem, 72rem)"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.btn}"
    padding: "0.85rem 1.35rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#E6F2F7"
    textColor: "{colors.navy}"
  button-navy:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.btn}"
    padding: "0.85rem 1.35rem"
    height: "48px"
  button-navy-hover:
    backgroundColor: "{colors.navy-dark}"
    textColor: "{colors.white}"
  button-gold:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.navy}"
    rounded: "0.7rem"
    padding: "0.85rem 1.5rem"
    height: "52px"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    rounded: "{rounded.btn}"
    padding: "0.85rem 1.35rem"
  input-default:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 0.85rem"
    height: "48px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    padding: "0.35rem 0.1rem"
    height: "44px"
  servicio-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.xl}"
    padding: "1.1rem 1.2rem"
---

# Design System: Salvación M

## Overview

**Creative North Star: "La Sala de Orientación"**

El sistema visual es un espacio calmado donde la persona entiende el siguiente paso. Predomina el azul marino institucional sobre blanco y marfil, con teal como guía secundaria y oro solo como acento discreto. La densidad es aireada: secciones amplias, tipografía de sistema legible y controles con área táctil generosa (≥44–48px).

La personalidad es profesional, serena y limpia. Rechaza dramatismo clínico, look gubernamental frío, estética “startup purple/glow” y urgencias visuales artificiales. El color no es el único portador de significado: tipografía, jerarquía y copy deben sostener la claridad.

**Key Characteristics:**
- Navy dominante + blanco/marfil; oro y teal como acentos raros
- Sans de sistema, escala fluida con `clamp()`
- Plano por defecto: profundidad tonal, no sombras
- Componentes refinados y contenidos; bordes suaves, CTA explícitos
- Mobile-first; contenedor ~72rem; lectura ~65–70ch

## Colors

Paleta institucional Salvación M: marina profunda, teal guía y oro discreto sobre neutros limpios.

### Primary
- **Azul Marino** (`{colors.navy}` / `#102A43`): cabecera, hero, títulos, CTA navy, bloques de confianza (`#servicios`, `#nosotros`).
- **Azul Marino Oscuro** (`{colors.navy-dark}` / `#091C2D`): pie y hover de botones navy.

### Secondary
- **Azul Medio** (`{colors.blue}` / `#145B82`): enlaces en fondo claro; refuerza el gradiente del hero.
- **Teal Guía** (`{colors.teal}` / `#086C72`): borde inferior del header, iconos de servicio, números del proceso, foco en tarjetas de servicio.

### Tertiary
- **Oro Discreto** (`{colors.gold}` / `#926B28`): acento sobre fondos claros cuando se necesita tono más sobrio.
- **Oro Claro** (`{colors.gold-bright}` / `#F0C35B`): etiquetas, barra de acento, CTA de servicios, labels de contacto en footer; hover nav `#FFDA85`.

### Neutral
- **Tinta** (`{colors.ink}` / `#243342`): texto de cuerpo.
- **Texto Atenuado** (`{colors.muted}` / `#526171`): ayudas y secundarios.
- **Marfil Suave** (`{colors.soft}` / `#FAF8F4`): fondo de contacto y superficies alternas.
- **Línea** (`{colors.line}` / `#D8DEE5`): bordes y separadores.
- **Blanco** (`{colors.white}` / `#FFFFFF`): superficie principal y tarjetas.
- **Foco** (`{colors.focus}` / `#1B65A5`): anillo `:focus-visible`.
- **Peligro** (`{colors.danger}` / `#8B1E1E`) + fondos `ok-bg` / `warn-bg` / `danger-bg`: estados de formulario.

### Named Rules
**The One Accent Rule.** El oro claro aparece en ≤10% de cualquier vista; su rareza marca jerarquía, no decoración.

**The Meaning Not Color Alone Rule.** Éxito, error y advertencia combinan color + texto; nunca solo el tinte.

## Typography

**Display Font:** system-ui (con -apple-system, Segoe UI, Arial)
**Body Font:** la misma pila de sistema
**Label/Mono Font:** misma pila; labels de sección usan tracking amplio

**Character:** Sans neutra y legible, sin fuentes remotas. Claridad institucional antes que expresión tipográfica.

### Hierarchy
- **Display** (700, `clamp(2.2rem, 5vw, 3.75rem)`, 1.2): hero `h1`; máx. ~18ch.
- **Headline** (700, `clamp(1.7rem, 3vw, 2.5rem)`, 1.2): `h2` de sección.
- **Title** (700, ~1.05–1.2rem, 1.2): `h3` de servicios, proceso y conceptos.
- **Body** (400, 1rem, 1.6): párrafos; longitud preferida 65–70ch.
- **Label** (750, ~0.78rem, letter-spacing 0.12em, mayúsculas de sección): etiquetas tipo `servicios-etiqueta`.

### Named Rules
**The System Stack Rule.** No introducir hojas de fuente hospedadas; la pila de sistema es normativa.

**The One H1 Rule.** Un solo `h1` representativo por página.

## Layout

Contenedor `width: min(100% - 2rem, 72rem)`. Ritmo vertical de sección `clamp(3rem, 6vw, 5.5rem)`. Hero y Nosotros en dos columnas; servicios en rejilla 2×3 (1 col &lt;600px); proceso en 3 cols (1 col &lt;1023px). Formulario: campos y radios en 2 cols → 1 col en móvil. Breakpoints observados: 1023px, 900px, 600px. Densidad aireada; gaps típicos 0.75–1.5rem.

### Named Rules
**The Content Breakpoint Rule.** Adaptar por contenido (grids que colapsan), no por device labels.

## Elevation & Depth

Sistema plano: no hay `box-shadow` en el CSS actual. La profundidad se logra con contraste tonal (bloques navy vs blanco/marfil), bordes `#D8DEE5` / `#dce7ec`, y acentos lineales (barra oro, conector teal del proceso).

### Named Rules
**The Flat-By-Default Rule.** Superficies en reposo sin sombra. El movimiento sutil (translateY en hover del CTA) es estado, no elevación estructural.

## Shapes

Radios suaves y coherentes: controles ~0.5–0.55rem, fieldsets ~0.8rem, tarjetas de servicio 1rem, paneles grandes ~1.25rem, números de proceso circulares (`border-radius: 50%`). Bordes 1px en neutro o teal cuando hay selección. Sin clip paths ni geometría agresiva.

### Named Rules
**The Soft Institution Rule.** Esquinas redondeadas moderadas; nunca “pill” como lenguaje dominante salvo círculos de paso.

## Components

Carácter: **refinado y contenido** — CTAs claros, bordes discretos, sin tarjetas espectaculares.

### Buttons
- **Shape:** radio suave (`0.55rem` / `0.7rem` en CTA oro)
- **Primary (hero):** fondo blanco, texto navy; hover `#E6F2F7` + leve `translateY(-2px)` si hay hover y motion permitida
- **Navy (Validar / proceso):** fondo navy, texto blanco; hover navy-dark / teal en proceso
- **Gold (servicios CTA):** fondo oro claro, texto navy
- **Ghost/disabled (Enviar):** borde línea, texto muted, opacity reducida cuando disabled
- **Focus:** `outline: 3px solid` focus o teal en tarjetas

### Cards / Containers
- **Corner Style:** 1rem (servicio) a 1.25rem (conceptos Nosotros)
- **Background:** blanco sobre navy, o fieldsets blancos sobre marfil
- **Shadow Strategy:** ninguna; borde 1px
- **Internal Padding:** ~1.1–1.2rem

### Inputs / Fields
- **Style:** borde `line`, fondo blanco, radio `0.5rem`, min-height 48px
- **Focus:** anillo global `:focus-visible` (`focus`)
- **Error / Disabled:** texto danger; fondos danger-bg / warn-bg; enviar disabled con opacity

### Navigation
- Header navy, texto blanco, peso 600; hover/focus `nav-hover` con underline offset
- Móvil (&lt;600px): menú columna + toggle 44×44; animación `menu-enter` si motion permitida

### Servicio row (signature)
Fila interactiva con icono teal en pastilla, título/descripción y flecha; hover fondo `#f4f9fb`; preselecciona servicio en el formulario.

## Do's and Don'ts

### Do:
- **Do** usar Azul Marino como ancla de marca en header, hero y secciones de confianza.
- **Do** reservar Oro Claro para acentos y CTAs secundarios de alta prioridad visual.
- **Do** mantener áreas táctiles ≥44px (preferible 48px en botones/campos).
- **Do** respetar `prefers-reduced-motion` (sin ciclo de color ni translate en hover).
- **Do** documentar estados de formulario con color + texto.

### Don't:
- **Don't** añadir sombras genéricas o glows; el sistema es flat-by-default.
- **Don't** introducir tipografías remotas ni stacks Inter/Roboto como marca.
- **Don't** usar púrpura, neón o dramatismo clínico en fotografía o UI.
- **Don't** fabricar testimonios, sellos o cifras de éxito en la interfaz.
- **Don't** simular éxito de envío con estilos “ok” sin persistencia real.
