# deal-proposal-agent

Genera propuestas comerciales one-pager (HTML estático) a partir de una plantilla base, desplegadas en Vercel. Cada propuesta es una página duplicada de la plantilla con sus `[VARIABLE]` reemplazadas.

## Estructura

- `plantilla_propuestas.html` — plantilla base. **No borrar ni renombrar.** Toda propuesta nueva se crea duplicando este archivo.
- `<slug>/index.html` — una carpeta por propuesta (ej. `propuesta-demo/index.html`), servida por Vercel en `/<slug>`.
- `api/notify.js` — función serverless (Vercel, runtime Node) que envía el aviso de Telegram. No tiene lógica de negocio adicional.
- `assets/` — imágenes fuente (ej. logo) usadas para generar los `data:` URIs embebidos en el HTML.
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

## Sistema de diseño: debe replicar clarytree.com

El sistema de diseño de `plantilla_propuestas.html` (bloque `:root` al inicio del `<style>`) está calcado del sitio principal **clarytree.com**, para que toda propuesta se sienta parte de la misma marca. Si clarytree.com cambia su diseño, este bloque debe actualizarse a la par. Tokens actuales (extraídos del sitio real, no inventados):

- Tipografía: **Geist** (texto y títulos) + **Geist Mono** (etiquetas pequeñas como los números de sección), cargadas vía `@import` de Google Fonts justo antes de `:root{` (un `@import` dentro de una regla es inválido — debe ir suelto).
- Color: fondo blanco / `#F8FAFC` (slate-50) alterno, texto `#020618` (títulos) y `#45556C` (cuerpo), acento azul de marca `#1C63D9`.
- Botones: siempre pill (`--radius-pill: 999px`), nunca esquinas cuadradas.
- Tarjetas: esquinas muy redondeadas (`--radius-lg: 22px`).
- Sombras y colores tintados con el tono de tinta (`rgba(2,6,24,...)`), no negro puro.
- Títulos con tracking negativo (`letter-spacing` ligeramente negativo) para el look "tech" del sitio.

No cambiar la estructura de las 9 secciones ni las animaciones por esto — solo los tokens visuales (tipografía, color, radios, sombras) deben coincidir con la marca.

## CTA de WhatsApp

El botón CTA final (sección 09) apunta siempre a `https://wa.me/573115118640` (WhatsApp fijo de la empresa), con `target="_blank" rel="noopener"`. No es una variable `[VARIABLE]` — es fijo en la plantilla, igual que el logo. El texto del botón sí es editable vía `[TEXTO_CTA]`.

## Datos fijos de la empresa

Además del logo y el WhatsApp del CTA, estos dos también son texto fijo (no variables) en toda propuesta:
- Nombre de la empresa: **ClaryTree Clinics** (`<title>` y pie de la sección de cierre).
- Contacto: **contacto.clarytree@gmail.com** (pie de la sección de cierre).

## Al crear una propuesta nueva

1. Duplicar `plantilla_propuestas.html` en `<slug>/index.html`.
2. Reemplazar todas las `[VARIABLE]` (incluyendo `data-client-name` en `<body>`, que debe quedar igual a `[NOMBRE_CLIENTE]`).
3. No tocar el script de notificación de Telegram ni el CTA de WhatsApp.
4. `git add`/commit incluye la nueva carpeta; `.env` y `Recording commercial calls/` quedan excluidos por `.gitignore`.

## Variables de entorno

| Variable | Dónde se usa | Fija o por propuesta |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `api/notify.js` (servidor) | Fija |
| `TELEGRAM_USER_ID` | `api/notify.js` (servidor) | Fija |
| `ASSEMBLYAI_API_KEY` | Reservada para transcripción local de grabaciones de videollamadas al redactar propuestas (aún no integrada) | Fija |

## Despliegue

Sitio estático + funciones serverless en `/api`, desplegado en Vercel conectado al repo de GitHub ([Nightseen/deal-proposal-agent](https://github.com/Nightseen/deal-proposal-agent)). Zero-config: Vercel sirve los `.html` como estáticos y `api/*.js` como funciones. Las variables de entorno de producción se configuran en el dashboard de Vercel (Project Settings → Environment Variables), no en `.env`.

## Carpeta de grabaciones

`Recording commercial calls/` contiene archivos pesados (grabaciones de videollamadas) y está excluida del repo vía `.gitignore`. No intentar commitear su contenido.
