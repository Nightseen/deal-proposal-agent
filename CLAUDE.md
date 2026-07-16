# deal-proposal-agent

Genera propuestas comerciales one-pager (HTML estático) a partir de una plantilla base, desplegadas en Vercel. Cada propuesta es una página duplicada de la plantilla con sus `[VARIABLE]` reemplazadas.

## Estructura

- `plantilla_propuestas.html` — plantilla base. **No borrar ni renombrar.** Toda propuesta nueva se crea duplicando este archivo.
- `<slug>/index.html` — una carpeta por propuesta (ej. `propuesta-demo/index.html`), servida por Vercel en `/<slug>`.
- `api/notify.js` — función serverless (Vercel, runtime Node) que envía el aviso de Telegram. No tiene lógica de negocio adicional.
- `assets/` — recursos visuales del proyecto (ej. `clarytree_icon_navy.png`, el isotipo) servidos directamente como archivos estáticos por Vercel en `/assets/<archivo>`. No se embeben en base64 (encarecería cada propuesta innecesariamente). En la plantilla el isotipo se pinta con CSS `mask-image` apuntando a ese PNG (no `<img src="...">`), así se puede recolorear por CSS (hoy en `--color-accent`, el azul de marca) sin depender del color propio del archivo fuente.
- `generate_hero.py` — script Python (usa `fal_client`) que genera con Flux (fal.ai) imágenes de formas orgánicas para el hero y las guarda en `assets/`. El prompt va en inglés (mejor fidelidad) y es configurable con `--prompt`. De aquí salió `hero-v6.jpg`, el frame base del video de fondo (ver feature abajo). Requiere `FAL_KEY` en el `.env`.
- `animate_hero.py` — script Python (usa `fal_client`) que anima una imagen del hero a video (Image-to-Video con Kling en fal.ai): sube la imagen con `upload_file()`, llama al endpoint `fal-ai/kling-video/v1/standard/image-to-video` con un pan lento horneado por prompt, y descarga el `.mp4` a `assets/`. De aquí salió `hero-v6-animated.mp4`, el video crudo (antes de hacerlo loop). Requiere `FAL_KEY` en el `.env`.
- `loop_hero.py` — script Python (usa el ffmpeg estático de `imageio-ffmpeg`, no el del sistema) que convierte un video en un loop "boomerang" sin corte: concatena el video hacia adelante + en reversa, así el último frame coincide con el primero y no hay salto al reiniciar. De aquí salió `hero-v6-loop.mp4`, el video de fondo del hero que se sirve en producción. No usa fal.ai. Estos tres son los únicos scripts Python del proyecto; el resto de la automatización es Node.
- `.env` / `.env.example` — variables de entorno. `.env` nunca se commitea.
- `.claude/skills/generador-propuestas-comerciales/` — skill (`/generador-propuestas-comerciales`) que arma una propuesta nueva completa a partir de la grabación de la llamada de ventas con el cliente: transcribe con AssemblyAI, analiza la transcripción y genera `<slug>/index.html`. Ver el `SKILL.md` de esa carpeta para el flujo completo.
- `transcripts/` — transcripciones generadas por el skill (gitignored, pueden tener info de clientes).

## Feature obligatorio: notificación por Telegram al abrir la propuesta

**Toda propuesta creada a partir de esta plantilla debe conservar este feature intacto.** Ya está implementado en `plantilla_propuestas.html`; al duplicar la plantilla no se toca.

Cómo funciona:
1. El `<body>` lleva `data-client-name="[NOMBRE_CLIENTE]"` (mismo valor que el placeholder `[NOMBRE_CLIENTE]` del resto de la página).
2. Un `<script>` al final del `<body>` lee ese atributo y hace `fetch('/api/notify', { method: 'POST', body: { cliente } })` al cargar la página. Es "fire and forget": si falla, no rompe la página (solo `console.warn`).
3. `api/notify.js` recibe ese POST, arma el texto exacto **"El cliente {cliente} acaba de abrir la propuesta comercial"** y lo envía con la API de Telegram (`sendMessage`) usando `TELEGRAM_BOT_TOKEN` y `TELEGRAM_USER_ID` leídos de `process.env` (nunca hardcodeados, nunca expuestos en el HTML).

Por qué vía función serverless y no JS directo en el navegador: el bot token de Telegram es un secreto — si se pusiera en el HTML/JS del cliente, cualquiera que vea el código fuente podría robarlo y enviar mensajes con el bot de la empresa. Por eso el token vive solo del lado del servidor (Vercel), y el HTML únicamente llama a `/api/notify`.

`TELEGRAM_BOT_TOKEN` y `TELEGRAM_USER_ID` son fijos de la empresa y no cambian entre propuestas: van en `.env` (local) y en las variables de entorno del proyecto en Vercel (producción).

## Feature obligatorio: barra de navegación fija con progreso de scroll

**Toda propuesta creada a partir de esta plantilla debe conservar este feature intacto.** Ya está implementado en `plantilla_propuestas.html` (elemento `<nav id="site-nav">` justo después de `<body>`); al duplicar la plantilla no se toca.

Cómo funciona:
1. La barra está oculta (`transform: translateY(-100%)`) hasta que el usuario baja más allá del hero; a partir de ahí queda fija arriba de la ventana (`initSiteNav()` en el `<script>` del final del `<body>`).
2. Muestra, de izquierda a derecha: logo + wordmark "ClaryTree" (enlaza a `#portada`) y enlaces de salto a 4 secciones fijas: Entendimiento, Alcance, Inversión, Cierre (`#entendimiento`, `#alcance`, `#inversion`, `#cierre`). El último enlace decía antes "Contacto"; se renombró porque `#cierre` no muestra ningún bloque de contacto (su título es "Próximo paso") y la etiqueta debe coincidir con el destino real.
3. Debajo de la barra hay un indicador de progreso de lectura: una línea que se rellena (`scaleX`) según cuánto se ha hecho scroll del documento total.
4. No usa `[VARIABLE]` — los textos y anchors son fijos, iguales en toda propuesta.
5. La barra se oculta por `transform`, no por `display`, así que sus enlaces seguirían siendo alcanzables con Tab aunque no se vean; `initSiteNav()` le agrega/quita el atributo `inert` en sincronía con `site-nav--visible` para que no reciba foco de teclado mientras está fuera de pantalla.

## Feature obligatorio: video de fondo en el Hero

**Toda propuesta creada a partir de esta plantilla debe conservar esta estructura.** Ya está implementado en `plantilla_propuestas.html` (`.hero__image` dentro de `.hero`, hermano de `.hero__content`, con un `<video class="hero__video">` adentro); al duplicar la plantilla no se toca. Es un activo de marca **fijo**, no una variable por propuesta.

Cómo funciona:
1. El hero **no** se divide en columnas — el texto (`.hero__content`) sigue ocupando todo el ancho, igual que siempre.
2. El fondo es un video fijo (`/assets/hero-v6-loop.mp4`, formas orgánicas abstractas en azul/blanco) con `object-fit: cover`, `object-position: center right` y `opacity: 0.9`. Lleva `autoplay loop muted playsinline` (el `muted` es obligatorio para que el navegador permita el autoplay) y `poster="/assets/hero-v6.jpg"` como primer frame estático para conexiones lentas. Ese `.mp4` es un **loop boomerang sin corte**: se generó con `animate_hero.py` (crudo → `hero-v6-animated.mp4`) y luego `loop_hero.py` (adelante + reversa → `hero-v6-loop.mp4`), porque el video crudo de Kling no cierra en el mismo frame con el que abre y al reiniciar se veía un salto.
3. Encima del video va un degradado (`.hero__image::after`) que "se genera desde la derecha": arranca transparente ahí (se ve el video completo) y crece hacia `--color-bg` opaco a la izquierda, donde vive el texto — así nunca compiten por protagonismo. En mobile (`<640px`) el degradado se ajusta para cubrir más superficie, ya que hay menos ancho disponible.
4. La velocidad de reproducción (0.5x) **no** se puede fijar por atributo HTML — la aplica `initHeroVideo()` (script al final del `<body>`) vía `video.playbackRate`, reaplicándola en `loadedmetadata` porque cargar la fuente puede resetearla. Ese mismo `initHeroVideo()` respeta `prefers-reduced-motion`: si el usuario lo pide, pausa el video y deja solo el poster estático.
5. El movimiento de deriva (pan lento de derecha a izquierda) ya viene **horneado en el propio video** (prompt de Kling en `animate_hero.py`); por eso el hero ya no usa la animación CSS `heroDrift` ni `data-parallax`.

## Feature obligatorio: contenedores de ícono en las tarjetas (Alcance, Exclusiones, Confianza)

**Toda propuesta creada a partir de esta plantilla debe conservar este feature intacto.** Ya está implementado en `plantilla_propuestas.html`; al duplicar la plantilla no se toca.

Cómo funciona:
1. Un sprite de íconos SVG fijo (`<svg id="icon-sprite">`, con `<symbol>` reutilizables) vive justo después de `<body>`, oculto (`width:0;height:0`). Nunca se renderiza directo — cada tarjeta lo referencia con `<use href="#icon-...">`.
2. Cada tarjeta que use la clase `.card` (secciones 04, 05 y 08) puede llevar además `.card--icon` + un `<span class="card__icon">` anclado a la esquina superior izquierda, sobresaliendo levemente del borde de arriba de la tarjeta (ver CSS `.card__icon`).
3. En **04. Alcance**, `build-proposal.js` rota automáticamente el ícono de cada tarjeta entre `#icon-check`, `#icon-chat`, `#icon-calendar` e `#icon-chart` según la posición del ítem — no se elige desde el JSON de entrada.
4. En **05. Exclusiones**, todas las tarjetas usan siempre `#icon-ban`.
5. En **08. Confianza** (sección estática, ver abajo), cada una de las 5 tarjetas tiene un ícono fijo elegido a mano según la métrica (`#icon-calendar-check`, `#icon-trend-down`, `#icon-refresh`, `#icon-trend-up`, `#icon-shield-check`).

## Feature obligatorio: sección 08 estática ("Resultados comprobados")

**Toda propuesta creada a partir de esta plantilla debe conservar este bloque tal cual.** La sección 08 ("Por qué confiar en nosotros") ya no toma datos del cliente — es un caso de uso real fijo, con 5 cifras mostrando: ~617 citas/mes automatizadas, 70% menos carga en recepción, ~140 citas recuperadas/mes, ~$14M retorno por recuperación/mes, <5% tasa de cancelación/ausentismo. Reutiliza el mismo marcado que la sección 04 (`.card`, `.scope-card__title`, `.scope-card__desc`, `.card--icon` / `.card__icon`), pero **no** como 5 tarjetas individuales: `.results-grid` las funde en una sola franja continua (fondo blanco, borde y radio compartidos) dividida por líneas finas (`border-left`/`border-top` según breakpoint), con el ícono en línea (no en placa flotante como en Alcance) y la primera cifra (~617, la más alta) destacada en azul de marca para romper la simetría. Este tratamiento es deliberado: una revisión de diseño (`$impeccable critique`, 2026-07-16) y su detector de patrones coincidieron, de forma independiente, en que 5 tarjetas idénticas con ícono flotante leían como el "hero-metric template" que `DESIGN.md` prohíbe, solo reubicado fuera del hero. Al duplicar la plantilla no se toca ni se le pide contenido al usuario para esta sección.

## Feature obligatorio: fondos de sección alternados full-width + hover de tarjetas

**Toda propuesta creada a partir de esta plantilla conserva este esquema.** Ya está en `plantilla_propuestas.html` (clases `.section--*` en cada `<section>` + reglas al final del `<style>`); al duplicar la plantilla no se toca. Estilo "full-width alternado" (tipo Apple): cada sección cambia de fondo para que se perciba un cambio de tema, con paleta sobria de salud.

Padding vertical **escalado por densidad de contenido** en desktop (`@media (min-width:641px)`, selectores por `#id` de sección para ganar especificidad): las secciones de un solo párrafo (`#entendimiento`, `#vision`) usan 108px; los grids/proof-bars cortos (`#exclusiones`, `#confianza`) usan 128px; las secciones ya densas (Alcance, Fases, Inversión: grid largo, timeline, card con ROI + medios de pago) se quedan en el base "airy" de 156px; el Cierre usa 140px (clímax visual, pesa más que el resto pero sin dejar tanto vacío como antes). En mobile (`<640px`) todas comparten el mismo 88px uniforme — la escala solo aplica en desktop, que es donde el padding fijo se sentía desproporcionado frente al contenido.

Fondos por sección (esquema fijo): 02 Entendimiento y 04 Alcance y 06 Fases en blanco; 03 Visión y 08 Confianza en azul lavado (`.section--blue` #EEF4FC); 05 Exclusiones en gris apagado (`.section--muted` #ECEDEF); 07 Inversión en oscuro plano (`.section--ink` `--color-ink-900` #0B1220, texto claro vía `--color-ink-inverse-soft` #C4D0DE); 09 Cierre en oscuro premium (`.section--premium`, degradado navy + glow azul + eyebrow cyan — el clímax visual). `--color-ink-900`/`--color-ink-inverse-soft` se tokenizaron tras un `$impeccable audit` (2026-07-16): antes eran literales `#0B1220`/`#C4D0DE` repetidos sin variable en Inversión, Cierre y el pie de página.

Hover de tarjetas (contraste semántico intencional):
- **Alcance** (`.scope-grid`): la tarjeta se eleva + zoom (`translateY(-6px) scale(1.02)`) con borde azul. Se apunta a nivel de grid para ganarle en especificidad a la regla del reveal escalonado, que si no fija `translateY(0)` y anula el lift.
- **Confianza** (`.results-grid`): ya no son tarjetas independientes (ver feature de la sección 08 arriba) — el hover solo tinta el fondo del ítem (`--color-bg-alt`), sin lift ni borde, porque toda la franja comparte un único borde/radio exterior.
- **Exclusiones** (`.section--muted`): lo contrario — la tarjeta se hunde (`translateY(4px) scale(0.99)`, sombra menor), borde e ícono en rojo arcilla (#C15B4F, no azul, que leería como "incluido"), ícono/título en gris en reposo, y el título encoge un poco al hover.

## Feature obligatorio: nodo animado en la cadena de "Cómo trabajamos" (sección 06)

**Toda propuesta lo conserva.** Lo crea `initTimelineNode()` (script al final del `<body>`), no está en el HTML fijo. Un nodo de acento recorre la línea de la cadena de fases: baja rodeando cada círculo **sobre su borde** (media vuelta, radio = radio del círculo, sin salirse) y entre círculos baja recto por el eje; al terminar el último círculo sube a media opacidad y por detrás de los círculos, en loop. La ruta se calcula por JS leyendo la posición real de cada círculo (`.phase__number`), así se adapta a cualquier número de fases. Arranca cuando el timeline entra en viewport y el reveal escalonado se asienta (si no, las posiciones quedan mal medidas), a velocidad constante (`linear`), y respeta `prefers-reduced-motion` (no se crea el nodo).

## Feature obligatorio: sistema de dos anchos + hero a esquinas + inversión premium + confianza proof bar

**Toda propuesta creada a partir de esta plantilla conserva este esquema.** Ya está en `plantilla_propuestas.html`; al duplicar la plantilla no se toca. Es un ajuste de layout, no de contenido — no usa `[VARIABLE]`.

- **Sistema de dos anchos.** `.container` sigue en el ancho de lectura angosto (860px) para las secciones de prosa (Entendimiento, Visión, Cierre). Se agregó el token `--container-wide: 1200px` y la utilidad `.container--wide` (aplica ese max-width) para las secciones "showcase". El contraste angosto/ancho es intencional y da ritmo editorial (leer vs. mostrar) — mantenerlo como regla si se agregan secciones.
- **Hero a esquinas.** El `.hero__content` lleva `container--wide`: como `.hero__meta` es `space-between`, el logo/wordmark quedan en la esquina izquierda y la fecha + consecutivo en la derecha. El titular y el subtítulo se acotan (`max-width: 760px` / `640px`) para que no corran sobre el video y se queden sobre la zona clara del degradado. La `.hero__date` cae sobre el video a plena opacidad, así que lleva un `text-shadow` claro para legibilidad.
- **Inversión (07) premium calmada.** La sección (`.section--investment` / `.section--ink`) suma un glow azul de marca contenido detrás de la card (`::before` radial), un filo de acento arriba de la card (`.investment-card::before`), y una **línea de ROI** (`.investment-card__roi`). Deliberadamente NO sube al nivel del cierre (sección 09), que sigue siendo el clímax visual. La línea de ROI es **copy FIJO de marca** (ancla el precio al caso probado de la sección 08: ~140 citas recuperadas / ~$14M de retorno) — no es variable por propuesta, y va después del `[FORMA_DE_PAGO]` opcional (el regex que borra la forma de pago corta en su `</p>`, así que la línea de ROI sobrevive aunque no haya forma de pago). Al fondo de la card va una **banda de medios de pago** (`.investment-card__payments`): logos monocromáticos en UN solo tono gris (`#94A3B8`, vía `currentColor`) de las franquicias (Visa, Mastercard, Diners) y **Bre-B** (transferencias instantáneas del Banco de la República). Es copy/logos FIJOS de marca — no variable por propuesta. La etiqueta "Medios de pago" (`.investment-card__payments-label`) usa `var(--color-ink-soft)`, no ese mismo `#94A3B8` — un `$impeccable audit` (2026-07-16) midió que el gris de los logos da solo 2.56:1 de contraste como texto (falla WCAG AA, que exige 4.5:1); como objeto gráfico un logo sí puede quedarse en 3:1, pero la etiqueta es texto real. La banda se trata como **disclaimer al pie de la card, no como la siguiente subsección del ROI**: `margin-top: 34px` la aleja del texto del ROI, pero el `border-top` va pegado a su propio contenido (`padding-top: 10px`) — así la línea separa al disclaimer del ROI en vez de leerse como el cierre del bloque de arriba. El padding inferior de `.investment-card` es mínimo (12px) para que la fila quede al ras del borde inferior. Layout en una sola fila — etiqueta "Medios de pago" a la izquierda, logos a la derecha (`justify-content: space-between`) — para minimizar su altura; en pantallas angostas hace wrap a dos filas (etiqueta arriba, logos abajo) sin solaparse. Logos a 11px de alto (`.pay-logo svg`).
- **Confianza (08) proof bar.** Su `.container` lleva `container--wide` y `.results-grid` pasa a `repeat(5, 1fr)`: las 5 KPIs quedan en una sola franja continua (banda horizontal, ver feature de la sección 08 arriba para el detalle del tratamiento visual). Responsivo: aguanta las 5 en fila hasta 900px, y por debajo degrada 5 → 3 → 2 → 1.

## Feature obligatorio: pie de página de marca

**Toda propuesta creada a partir de esta plantilla conserva este bloque.** Ya está en `plantilla_propuestas.html` (elemento `<footer class="site-footer">` justo después de `</main>`); al duplicar la plantilla no se toca. No usa `[VARIABLE]` — es fijo de marca.

Cómo funciona:
1. Barra oscura (`var(--color-ink-900)`, #0B1220) al fondo de la página, **cohesiva con el cierre premium** (sección 09) en vez del gris de un footer genérico. Grid de 3 columnas (`1fr auto 1fr`) para que los accesos del centro queden centrados sin importar el ancho de los lados; en móvil (`<640px`) apila © → accesos → región. Banda deliberadamente compacta (`padding: 18px 0`, íconos de 36px con SVG de 15px) — es un pie de contacto, no una sección de contenido, así que no sigue la escala "airy" del resto de la página.
2. **Izquierda:** copyright fijo "© 2026 ClaryTree Clinics. Todos los derechos reservados.".
3. **Centro:** tres accesos directos con ícono (SVG monocromático `fill: currentColor`, se ilumina a blanco + borde azul en hover): **WhatsApp** (`https://wa.me/573115118640`, el mismo fijo del CTA), **correo** (`mailto:contacto.clarytree@gmail.com`, el contacto fijo) y **página web** (`https://clarytree.com`, el sitio principal). Los tres son datos fijos de la empresa (ver abajo), no variables.
4. **Derecha:** etiqueta de región "Colombia".

## Sistema de diseño: debe replicar clarytree.com

El sistema de diseño de `plantilla_propuestas.html` (bloque `:root` al inicio del `<style>`) está calcado del sitio principal **clarytree.com**, para que toda propuesta se sienta parte de la misma marca. Si clarytree.com cambia su diseño, este bloque debe actualizarse a la par. Tokens actuales (extraídos del sitio real, no inventados):

- Tipografía: **Geist** (texto y títulos) + **Geist Mono** (etiquetas pequeñas como los números de sección), cargadas vía `@import` de Google Fonts justo antes de `:root{` (un `@import` dentro de una regla es inválido — debe ir suelto).
- Color: fondo blanco / `#F8FAFC` (slate-50) alterno, texto `#020618` (títulos) y `#45556C` (cuerpo), acento azul de marca `#1C63D9`. El isotipo (logo) se pinta en este mismo azul (`--color-accent`), unificando el lockup logo+wordmark en un solo color — antes iba en cyan, se cambió porque un lockup de marca debería leerse como un solo color, no dos tonos de azul distintos side-by-side. Además hay un tono **cyan** (`--color-cyan: #06B6D4`) reservado como acento raro para momentos puntuales: el eyebrow "Resultados comprobados" de la sección 08 y el eyebrow del Cierre (sección 09) — NO viene de clarytree.com (el sitio no usa cyan), es una decisión de diseño de esta plantilla; si se define un cyan de marca oficial más adelante, actualizar aquí. El Cierre usa además dos literales fuera de esa paleta documentada, ambos exclusivos de `.section--premium` (de un solo uso cada uno, por eso no se tokenizaron como `--color-ink-900`/`--color-ink-inverse-soft`): `#22D3EE` (cyan más brillante, solo en el número de sección "09" sobre el fondo oscuro, donde `--color-cyan-text` perdería legibilidad) y `#0E1A33` (extremo oscuro del degradado de fondo, junto a `var(--color-ink-900)`).
- Botones: siempre pill (`--radius-pill: 999px`), nunca esquinas cuadradas.
- Tarjetas: esquinas muy redondeadas (`--radius-lg: 22px`).
- Sombras y colores tintados con el tono de tinta (`rgba(2,6,24,...)`), no negro puro.
- Títulos con tracking negativo (`letter-spacing` ligeramente negativo) para el look "tech" del sitio.

No cambiar la estructura de las 9 secciones ni las animaciones por esto — solo los tokens visuales (tipografía, color, radios, sombras) deben coincidir con la marca.

## CTA de WhatsApp

El botón CTA final (sección 09) apunta siempre a `https://wa.me/573115118640` (WhatsApp fijo de la empresa), con `target="_blank" rel="noopener"`. No es una variable `[VARIABLE]` — es fijo en la plantilla, igual que el logo. El texto del botón sí es editable vía `[TEXTO_CTA]`. Es el único CTA de toda la propuesta: la sección 07 (Inversión) ya no tiene botón propio, solo precio y forma de pago.

## Datos fijos de la empresa

Además del WhatsApp del CTA, estos también son fijos (no variables) en toda propuesta:
- Logo: isotipo `assets/clarytree_icon_navy.png`, pintado por `mask-image` en el azul de marca (`--color-accent`) — ver `## Estructura`. Aparece en el hero, en la barra de navegación fija y en el pie del Cierre (mismo elemento `.brand__logo`, una sola fuente de color para los tres).
- Wordmark: texto **"ClaryTree"** junto al logo, mismo lugar que el logo.
- Nombre de la empresa: **ClaryTree Clinics** (`<title>` y pie de la sección de cierre).
- Contacto: **contacto.clarytree@gmail.com** (acceso de correo del pie de página; ya NO se muestra como texto bajo el CTA del cierre — quedaba redundante con el ícono del footer).
- Página web: **https://clarytree.com** (acceso del pie de página).
- Título por defecto del hero: **"Propuesta comercial - Implementación agentes IA para [NOMBRE_CLIENTE]"** — solo `[NOMBRE_CLIENTE]` es variable.
- Subtítulo del hero: **"[NOMBRE_CLIENTE] + ClaryTree"** (ya no usa `[NOMBRE_PROYECTO]`, que se eliminó de la plantilla).
- Logo en el pie de cierre (sección 09): el isotipo (azul de marca) aparece centrado entre el botón CTA y "ClaryTree Clinics".

## Al crear una propuesta nueva

1. Duplicar `plantilla_propuestas.html` en `<slug>/index.html`.
2. Reemplazar todas las `[VARIABLE]` (incluyendo `data-client-name` en `<body>`, que debe quedar igual a `[NOMBRE_CLIENTE]`). `[NUMERO_PROPUESTA]` sigue el formato `PROP-<año>-<consecutivo>`; si se usa `build-proposal.js` se autogenera solo (ver `data-schema.md` del skill).
3. No tocar el script de notificación de Telegram, el CTA de WhatsApp, la barra de navegación fija, el sprite de íconos SVG (`<svg id="icon-sprite">`), el video de fondo del hero (`.hero__image` + `.hero__video`), ni la sección 08 estática.
4. `git add`/commit incluye la nueva carpeta; `.env` y `Recording commercial calls/` quedan excluidos por `.gitignore`.

## Variables de entorno

| Variable | Dónde se usa | Fija o por propuesta |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `api/notify.js` (servidor) | Fija |
| `TELEGRAM_USER_ID` | `api/notify.js` (servidor) | Fija |
| `ASSEMBLYAI_API_KEY` | Reservada para transcripción local de grabaciones de videollamadas al redactar propuestas (aún no integrada) | Fija |
| `FAL_KEY` | `generate_hero.py` y `animate_hero.py` (local) | Fija |

## Despliegue

Sitio estático + funciones serverless en `/api`, desplegado en Vercel conectado al repo de GitHub ([Nightseen/deal-proposal-agent](https://github.com/Nightseen/deal-proposal-agent)). Zero-config: Vercel sirve los `.html` como estáticos y `api/*.js` como funciones. Las variables de entorno de producción se configuran en el dashboard de Vercel (Project Settings → Environment Variables), no en `.env`.

## Carpeta de grabaciones

`Recording commercial calls/` contiene archivos pesados (grabaciones de videollamadas) y está excluida del repo vía `.gitignore`. No intentar commitear su contenido.
