# SALVACIÓN M — Sistema de diseño institucional premium
**Versión:** 2.0.0 | **Estado:** ESPECIFICACIÓN APROBADA COMO DIRECCIÓN VISUAL | **Fecha:** 2026-11-02

## 1. Principio rector
El diseño debe expresar confianza institucional y claridad sin parecer un portal gubernamental ni sacrificar cercanía. Azul marino predominante, blanco y neutros limpios, dorado discreto únicamente como acento. El color no debe ser el único portador de significado.

## 2. Tokens iniciales propuestos
| Token | Valor | Uso |
|---|---|---|
| `--color-navy-900` | `#102A43` | encabezado, hero, títulos |
| `--color-navy-700` | `#234B68` | elementos secundarios |
| `--color-gold-600` | `#926B28` | acentos sobre fondos claros |
| `--color-gold-300` | `#E8D5AC` | bordes decorativos |
| `--color-white` | `#FFFFFF` | superficie principal |
| `--color-ivory` | `#FAF8F4` | superficie alterna |
| `--color-slate-900` | `#243342` | texto principal |
| `--color-slate-600` | `#526171` | texto secundario, sujeto a contraste |
| `--color-border` | `#D8DEE5` | separadores |
| `--color-focus` | `#1B65A5` | foco visible |

Son tokens de especificación; validar relaciones de contraste en los contextos finales antes de declarar cumplimiento WCAG.

## 3. Tipografía
Sans serif de sistema, sin depender de servicios externos: `system-ui, -apple-system, "Segoe UI", Arial, sans-serif`. Base sugerida `16px`, interlineado 1.5–1.7, longitud de línea preferida 60–75 caracteres. Escala fluida con `clamp()`, sin texto crítico incrustado en imágenes. Un solo `h1` representativo por página y jerarquía lógica.

## 4. Espaciado y composición
Escala `4, 8, 12, 16, 24, 32, 48, 64px`. Contenedor máximo aproximado `1200px`, lectura larga `70ch`. Mobile first; sin desplazamiento horizontal a 320 CSS px. Usar grid y flex nativos. Puntos de adaptación guiados por contenido, no por dispositivos específicos.

## 5. Componentes obligatorios
- Cabecera con marca, navegación, enlace “Saltar al contenido” y menú accesible.
- Hero con titular, explicación, CTA principal y secundario; evitar carruseles automáticos.
- Tarjetas de servicio con título y descripción, sin convertir todo el bloque en controles ambiguos.
- Pasos de atención en secuencia comprensible.
- Bloque de transparencia y alcance.
- Formulario con `label`, ayuda, validación accesible, `aria-describedby`, estados de envío, errores y confirmación verificable.
- Pie de página con contacto, privacidad y términos.
- Estados de carga, vacío, error y éxito; no inventar datos ni confirmaciones.

## 6. Botones y enlaces
Primario: fondo azul marino y texto blanco; secundario: borde azul marino sobre fondo claro. Dorado solo para acentos o detalles, no como único indicador de CTA. Foco visible de alto contraste, área táctil preferida >=44 × 44 CSS px, texto de acción explícito. No usar enlaces falsos.

## 7. Accesibilidad y comportamiento
Objetivo WCAG 2.2 AA: teclado completo, orden de foco coherente, escape en menú modal cuando aplique, foco restaurado, reflow, zoom 200–400%, `prefers-reduced-motion`, errores identificables y no solo cromáticos, alternativas textuales, contraste de texto 4.5:1 normal y 3:1 grande donde aplique. Revisar también contraste no textual 3:1 en componentes relevantes. Pruebas automáticas no sustituyen revisión manual.

## 8. Fotografía e iconografía
Imágenes reales o autorizadas que representen diversidad de personas y atención respetuosa; evitar dramatización, batas que sugieran prestación clínica directa y uso no autorizado de rostros o testimonios. Iconos lineales consistentes y decorativos ocultos a lectores de pantalla cuando proceda. No usar emblemas oficiales que impliquen aval estatal.

## 9. Responsive y rendimiento
Imágenes optimizadas, dimensiones reservadas para evitar saltos, carga diferida cuando corresponda, sin fuentes remotas obligatorias, JavaScript progresivo, controles utilizables sin hover y experiencia tolerante a conexiones lentas. Evaluar Core Web Vitals en QA, no asumir resultados.

## 10. Privacidad y seguridad por diseño
No mostrar información sensible en URL, logs o analítica. Formulario y CRM requieren controles backend; la validación del navegador es complementaria. No incorporar rastreadores o servicios de terceros sin revisión de privacidad.

## 11. Criterios de aceptación visual
- Diseño institucional premium reconocible en móvil y escritorio.
- Tokens usados consistentemente, sin colores arbitrarios.
- Contrastes calculados y pruebas con teclado, zoom y lector de pantalla.
- Mensajes de confianza sin promesas de resultado.
- Pruebas de flujo y errores del formulario contra API real en QA.
- Evidencias por SHA, capturas y resultados fechados.

## 12. Estado de verificación
`DESIGN_SPEC = TRUE` (documento). `VISUAL_IMPLEMENTATION = FALSE`. `WCAG_2_2_AA_VERIFIED = FALSE`. `G3_PASS = FALSE`.
