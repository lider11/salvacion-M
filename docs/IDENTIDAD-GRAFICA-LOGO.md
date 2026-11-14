# Identidad gráfica — logo aprobado v1.0

**Aprobación:** 2026-11-02, usuario responsable. **Alcance:** símbolo vectorial sin texto.

## Archivos
- `assets/logo-salvacion-m.svg`: versión principal azul marino y dorado, vista 512×512.
- `assets/logo-salvacion-m-monocromo.svg`: versión de un color heredado mediante `currentColor`; en etiqueta `<img>` el color puede depender del contexto del SVG, por lo que para un color controlado conviene insertar SVG inline o generar variante con color fijo.

## Significado
Arco azul: protección y confianza. Cruz dorada: referencia a salud y orientación. Mano dorada: apoyo y acompañamiento. No implica prestación clínica ni aval de entidad oficial.

## Uso
- Mantener proporciones originales, espacio libre mínimo del 10 % del ancho alrededor del símbolo.
- Tamaño sugerido >= 40 CSS px en interfaz, sujeto a revisión de legibilidad.
- Sobre fondo claro utilizar versión principal. Sobre fondo oscuro revisar contraste y preparar variante específica antes de publicar.
- Si es decorativo y existe texto de marca junto a él: `alt=""`. Si comunica la marca por sí solo: `alt="Salvación M"`.
- No deformar, recolorear arbitrariamente ni añadir efectos, sombras o animaciones.
- Nota técnica: la versión principal tiene fondo exterior transparente, pero contiene un trazado blanco interior para definir la mano; revisar sobre fondos no blancos.

## Criterios de aceptación
1. SVG parseable y con `viewBox`.
2. Rutas y colores corresponden a la versión aprobada.
3. Se puede renderizar sin JS ni recursos externos.
4. Integración real, contraste y visualización móvil deben verificarse posteriormente en QA.

**Estado:** logo aprobado, en repositorio e integrado en la landing. Revisar contraste sobre fondos no blancos antes de publicar.
