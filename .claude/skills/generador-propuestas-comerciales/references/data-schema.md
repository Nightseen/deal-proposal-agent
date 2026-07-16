# Esquema del JSON para build-proposal.js

Mapeo de cada campo del JSON al placeholder que reemplaza en `plantilla_propuestas.html`. Todos son string excepto donde se indica arreglo.

| Campo JSON | Placeholder | Notas |
|---|---|---|
| `slug` | (nombre de carpeta) | Formato `propuesta-nombre-cliente`, minúsculas, guiones, sin tildes. Obligatorio. |
| `fecha` | `[FECHA]` | Fecha de la propuesta. |
| `numeroPropuesta` | `[NUMERO_PROPUESTA]` | Opcional. Formato `PROP-<año>-<consecutivo>` (ej. `PROP-2026-002`). Si se omite, `build-proposal.js` lo autogenera contando las carpetas `propuesta-*` ya existentes (sin contar `propuesta-demo`). |
| `nombreCliente` | `[NOMBRE_CLIENTE]` y `data-client-name` | Mismo valor en ambos lugares automáticamente. También arma el subtítulo fijo del hero: "[NOMBRE_CLIENTE] + ClaryTree". |
| `parrafoEntendimiento` | `[PARRAFO_ENTENDIMIENTO]` | Bloque único — párrafo completo. |
| `parrafoVision` | `[PARRAFO_VISION]` | Bloque único — párrafo completo. |
| `imagenVision` | `[IMAGEN_VISION]` | Opcional. Si se omite (no incluir la clave o dejarla vacía/null), el script quita toda la capa de parallax de la sección de visión. |
| `alcance` | `[LISTA_ALCANCE]` | Arreglo de `{ "titulo": "...", "descripcion": "..." }`, 4–8 ítems recomendado. Cada tarjeta se genera con un contenedor de ícono (`.card__icon`) en la esquina superior izquierda; `build-proposal.js` rota el ícono automáticamente entre `#icon-check`, `#icon-chat`, `#icon-calendar` e `#icon-chart` según la posición del ítem — no hace falta ni se puede elegir el ícono desde el JSON. |
| `exclusiones` | `[LISTA_EXCLUSIONES]` | Arreglo de strings. Cada string se renderiza como título en negrilla dentro de una tarjeta `.card` — mismo estilo y clases (`.scope-card__title`) que Alcance, con el mismo contenedor de ícono pero siempre con `#icon-ban`. |
| `fases` | `[FASES]` | Arreglo de `{ "nombre": "...", "descripcion": "...", "tiempo": "..." }`. El número de fase (01, 02...) se genera solo según el orden del arreglo. |
| `notaTiempos` | `[NOTA_TIEMPOS]` | Aclaración de que los tiempos son aproximados. Ver regla de tiempos por defecto en `SKILL.md` (máx. 1 semana multisede / menos de 1 semana unisede, salvo que la llamada indique otra cosa). |
| `precio` | `[PRECIO]` | Ya formateado como texto a mostrar (ej. `"$4.200.000 COP"`). |
| `formaDePago` | `[FORMA_DE_PAGO]` | Opcional. Condiciones de flexibilidad de pago si las hay (ej. "50% para iniciar, 50% contra entrega"). Si se omite, el script quita el párrafo entero — la sección de inversión ya no tiene botón de CTA, solo precio y (si aplica) forma de pago. |
| `parrafoCierre` | `[PARRAFO_CIERRE]` | Bloque único. |
| `textoCta` | `[TEXTO_CTA]` | Texto del botón final (ej. "Hablemos por WhatsApp"). |

Campos que **no** van en este JSON porque ya son fijos en la plantilla (no se tocan): logo, wordmark "ClaryTree", `NOMBRE_EMPRESA` ("ClaryTree Clinics"), `CONTACTO` (contacto.clarytree@gmail.com), el WhatsApp del CTA final, la barra de navegación fija con progreso de scroll, el script de notificación por Telegram, el sprite de íconos SVG (`<svg id="icon-sprite">` justo después de `<body>`), el video de fondo del hero (`/assets/hero-v6-loop.mp4`, fijo), y la sección 08 completa ("Por qué confiar en nosotros" / módulo "Resultados comprobados" — estática, ya no toma diferenciadores/garantía/credenciales/testimonio del cliente, incluidos sus íconos fijos por métrica).
