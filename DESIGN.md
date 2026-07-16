---
name: ClaryTree Propuestas Comerciales
description: One-pager de venta clínico-premium que replica la identidad de clarytree.com
colors:
  brand-blue: "#1C63D9"
  brand-blue-soft: "#8FB4EC"
  accent-cyan: "#06B6D4"
  accent-cyan-text: "#0E7490"
  ink: "#020618"
  ink-soft: "#45556C"
  bg: "#FFFFFF"
  bg-alt: "#F8FAFC"
  surface: "#FFFFFF"
  border: "#E2E8F0"
  navy-deep: "#0E1A33"
  cyan-bright: "#22D3EE"
  ink-900: "#0B1220"
  ink-inverse-soft: "#C4D0DE"
typography:
  display:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 6vw, 3.625rem)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: "0.625rem"
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "16px"
  lg: "22px"
  pill: "999px"
spacing:
  section-tight: "108px"
  section-md: "128px"
  section-base: "156px"
  section-closing: "140px"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "32px"
  card-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
---

# Design System: ClaryTree Propuestas Comerciales

## 1. Overview

**Creative North Star: "El Expediente Clínico Premium"**

El sistema replica clarytree.com para que cada propuesta se sienta como una extensión directa de la marca, nunca como un documento aparte. La paleta y la tipografía comunican sobriedad de historia clínica — blanco, azul de marca, grises tintados de tinta — pero el acabado (radios muy redondeados, sombras suaves tintadas, ritmo editorial de anchos alternados) traiciona un pulido de producto tech, no de formulario médico. Es un sistema que gana confianza mostrando cifras (~617 citas/mes, $14M de retorno) antes que adjetivos, y que reserva el color a un único acento dominante: el resto son variaciones tonales de tinta.

Explícitamente rechaza el look de PDF/deck corporativo genérico (sin identidad propia, plantilla de agencia) y los clichés de landing SaaS (hero-metric, tarjetas idénticas, eyebrows repetidos sección tras sección) — la plantilla ya evita esto último con su esquema de fondos alternados y su sección 08 estática de prueba social, no un grid de features genérico.

**Key Characteristics:**
- Un solo acento cromático dominante (`#1C63D9`); el cyan es un privilegio raro, no un segundo color
- Radios muy redondeados (22px en tarjetas, pill en botones) — firme pero suave, nunca cuadrado
- Sombras y overlays tintados de tinta (`rgba(2,6,24,...)`), nunca negro puro
- Ritmo editorial: ancho angosto (860px) para prosa, ancho amplio (1200px) para secciones "showcase"
- Padding vertical escalado por densidad de contenido, no uniforme

## 2. Colors

Blanco dominante con un único azul de marca como acento; el resto de la paleta son tintes de tinta (ink) en distintas intensidades, nunca grises neutros puros.

### Primary
- **Azul ClaryTree** (`#1C63D9` / `--color-accent`): el único acento cromático dominante. Logo/isotipo, CTAs, enlaces activos, bordes de hover en tarjetas, filo de acento de la card de inversión. Pintado por `mask-image` sobre el isotipo para que un solo token gobierne logo + wordmark.
- **Azul Suave** (`#8FB4EC` / `--color-accent-soft`): versión atenuada del azul de marca, usada sobre fondos oscuros (separador de fecha del hero, número de sección en `.section--ink`) donde el azul pleno perdería legibilidad.

### Tertiary
- **Cyan de Acento** (`#06B6D4` / `--color-cyan`) y su variante texto (`#0E7490` / `--color-cyan-text`): reservado a exactamente dos eyebrows de toda la propuesta (sección 08 "Resultados comprobados" y el eyebrow del Cierre). No es un color de marca oficial de clarytree.com — es una decisión puntual de esta plantilla para marcar los dos momentos de mayor prueba/clímax.
- **Cyan Brillante** (`#22D3EE`): variante más saturada del cyan de acento, usada únicamente en el número de sección ("09") del Cierre, sobre el fondo navy profundo — necesita más brillo que `--color-cyan-text` para mantenerse legible ahí. No reemplaza a `--color-cyan`/`--color-cyan-text` en ningún otro lugar.

### Neutral
- **Tinta 900** (`#0B1220` / `--color-ink-900`): fondo de los dos únicos momentos oscuros de la plantilla (`.section--ink` en Inversión, extremo inicial del degradado de `.section--premium` en Cierre, y el pie de página). Nunca un color de superficie en secciones claras.
- **Navy Profundo** (`#0E1A33`): punto final del degradado de fondo de `.section--premium` (Cierre) — el extremo oscuro del gradiente que arranca en `--color-ink-900`.
- **Tinta Inversa Suave** (`#C4D0DE` / `--color-ink-inverse-soft`): texto de cuerpo sobre los fondos oscuros anteriores (`.section-text` en Inversión/Cierre, íconos del pie de página) — la contraparte de `--color-ink-soft` para fondo oscuro.
- **Tinta** (`#020618` / `--color-ink`): texto de títulos, máximo contraste.
- **Tinta Suave** (`#45556C` / `--color-ink-soft`): texto de cuerpo — nunca gris genérico, siempre este tinte específico.
- **Blanco** (`#FFFFFF` / `--color-bg`, `--color-surface`): fondo base y superficie de tarjetas.
- **Blanco Roto** (`#F8FAFC` / `--color-bg-alt`): fondo alterno para el ritmo de secciones.
- **Borde** (`#E2E8F0` / `--color-border`): único color de borde en todo el sistema.

### Named Rules
**La Regla del Acento Único.** El azul de marca (`--color-accent`) es el único color que puede dominar una superficie. El cyan nunca compite con él — aparece en un máximo de dos eyebrows por propuesta, nunca en botones, bordes o iconografía funcional.

**La Regla de la Tinta, no del Negro.** Ninguna sombra, overlay o texto "gris" usa negro puro o gris neutro (`#000`, `#666`, `#999`). Todo tinte deriva de `rgba(2, 6, 24, X)` o de `--color-ink-soft`, para que el sistema completo comparta una sola temperatura de color.

## 3. Typography

**Display Font:** Geist (con fallback a system-ui)
**Body Font:** Geist (misma familia que display — un solo sistema, no un pairing)
**Label/Mono Font:** Geist Mono (etiquetas pequeñas: números de sección, medios de pago)

**Character:** Geist para todo el cuerpo tipográfico da un look "tech" unificado — no hay contraste serif/sans porque la marca de origen (clarytree.com) tampoco lo usa. El contraste vive en el peso y el tracking, no en la familia.

### Hierarchy
- **Display** (700, `clamp(2rem, 6vw, 3.625rem)`, line-height 1.18, tracking -0.03em): titular del hero. Acotado a `max-width: 760px` para no correr sobre el video de fondo.
- **Headline** (700, tamaños de sección, tracking negativo ligero): títulos de sección (`.section-title`).
- **Title** (600-700, tamaño de tarjeta): títulos de tarjeta (`.scope-card__title`).
- **Body** (400, 1rem, line-height 1.6, color `--color-ink-soft`): prosa de secciones angostas (Entendimiento, Visión, Cierre), tope de 65-75ch.
- **Label** (500, `Geist Mono`, 0.625rem, tracking 0.08em, uppercase): números de sección, etiqueta "Medios de pago" — el único lugar donde aparece la mono.

### Named Rules
**La Regla del Tracking Negativo.** Todo título usa `letter-spacing` ligeramente negativo (nunca por debajo de -0.04em) para el look "tech" del sitio origen — nunca tracking positivo salvo en labels mono uppercase.

## 4. Elevation

Sistema de sombras suaves y tintadas de tinta, en reposo casi plano y con elevación solo como respuesta a estado (hover). No hay tonal layering de superficies — el fondo alterna entre blanco y blanco roto por sección, no por profundidad.

### Shadow Vocabulary
- **`--shadow-sm`** (`0 1px 3px rgba(2,6,24,.10), 0 1px 2px rgba(2,6,24,.06)`): reposo de elementos pequeños (badges, tags de exclusión).
- **`--shadow-md`** (`0 4px 6px rgba(2,6,24,.10), 0 2px 4px rgba(2,6,24,.10)`): hover de tarjetas y botones, CTA en reposo.
- **`--shadow-lg`** (`0 10px 15px rgba(2,6,24,.15), 0 4px 6px rgba(2,6,24,.15)`): hover del CTA principal, card de inversión.

### Named Rules
**La Regla del Reposo Plano.** Ninguna tarjeta lleva sombra en reposo salvo `--shadow-sm` en elementos ya pequeños; la sombra crece únicamente como reacción al hover, nunca como decoración estática de fondo.

## 5. Components

Firmes pero suaves: geometría muy redondeada y sombras discretas dan sensación de confiabilidad sin caer en frío/corporativo. El foco sigue siendo el contenido — los componentes no compiten con las cifras y el texto.

### Buttons
- **Shape:** pill completo (`border-radius: 999px`), nunca esquina cuadrada.
- **Primary:** fondo `--color-accent`, texto `--color-bg`, padding `16px 32px`.
- **Hover / Focus:** fondo pasa a `--color-ink` (no una variante del azul), con `--shadow-md`/`--shadow-lg` y leve `transform`. Transición `var(--dur-fast/base) var(--ease-out-soft)`.
- **Único CTA de toda la propuesta:** el botón de WhatsApp en el Cierre — no hay botones secundarios compitiendo.

### Cards / Containers
- **Corner Style:** `--radius-lg` (22px) en todas las tarjetas de contenido (Alcance, Exclusiones, Confianza, Inversión); `--radius-sm` (8px) en elementos pequeños (badges de exclusión, focus outline).
- **Background:** `--color-surface` (blanco) sobre fondos claros/azul-lavado; nunca tarjeta oscura sobre fondo oscuro.
- **Shadow Strategy:** plana en reposo, `--shadow-md` al hover con `border-color: var(--color-accent)`.
- **Border:** `1px solid var(--color-border)` como base, se sustituye por azul de marca solo al hover (Alcance/Confianza) o por rojo arcilla `#C15B4F` al hover (Exclusiones — contraste semántico intencional: "esto no incluye").
- **Internal Padding:** 32px estándar de tarjeta.

### Icon Containers
- Sprite SVG fijo (`#icon-sprite`) referenciado por `<use>`, nunca `<img>`. `.card__icon` ancla en la esquina superior izquierda de la tarjeta, sobresaliendo levemente del borde superior.

### Navigation
- Barra fija oculta hasta pasar el hero (`transform: translateY(-100%)` → visible), fondo blanco translúcido con `border-bottom: 1px solid var(--color-border)`.
- Enlaces en `--color-ink-soft`, pasan a `--color-accent` en hover/focus — sin subrayado, solo cambio de color.
- Barra de progreso de scroll: línea que crece por `scaleX()`, color `--color-accent`.

### Signature Component: Investment Card (Inversión premium calmada)
Tarjeta de precio con glow radial de marca contenido detrás (`::before` radial en `--color-accent` a 28% opacidad), filo de acento superior de 3px, línea de ROI que ancla el precio al caso de uso probado, y una banda de medios de pago tratada como disclaimer al pie (separación grande del ROI, separación mínima del borde de la tarjeta) — nunca al mismo nivel visual que el Cierre, que sigue siendo el clímax de la página.

## 6. Do's and Don'ts

### Do:
- **Do** usar `--color-accent` (#1C63D9) como único acento dominante — logo, CTA, hovers activos.
- **Do** mantener radios muy redondeados (22px tarjetas, pill botones) — firme pero suave.
- **Do** tintar toda sombra/overlay con `rgba(2,6,24,X)`, nunca negro puro ni gris neutro.
- **Do** anteponer cifras concretas (617 citas/mes, $14M retorno, <5% cancelación) a cualquier promesa genérica de valor.
- **Do** reservar el cyan (`#06B6D4`) a máximo dos eyebrows por propuesta.

### Don't:
- **Don't** diseñar como un PDF o deck corporativo genérico — sin personalidad, plantilla de agencia sin identidad propia.
- **Don't** caer en clichés de landing SaaS: hero-metric template, tarjetas idénticas repetidas sin variación, eyebrow uppercase encima de cada sección.
- **Don't** usar un segundo color dominante junto al azul de marca — el cyan es privilegio raro, no alternativa.
- **Don't** subir la sección de Inversión al mismo nivel visual/energético que el Cierre — el Cierre es el único clímax de la página.
- **Don't** usar `border-left`/`border-right` como acento decorativo, ni gradiente en texto, ni glassmorphism decorativo — ninguno de estos existe en el sistema actual y no deben introducirse.
