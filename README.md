# deal-proposal-agent

Propuestas comerciales one-pager (HTML estático) generadas a partir de una plantilla base, con notificación automática por Telegram al abrirse y desplegadas en Vercel.

Ver [CLAUDE.md](./CLAUDE.md) para la arquitectura completa y las reglas obligatorias para crear propuestas nuevas.

## Setup local

1. Copiar `.env.example` a `.env` y completar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_USER_ID`.
2. No commitear `.env`.

## Crear una propuesta nueva

Duplicar `plantilla_propuestas.html` en `<slug>/index.html` y reemplazar los placeholders `[VARIABLE]`. Ver la lista completa de variables en el comentario al inicio de `plantilla_propuestas.html`.

## Deploy

Proyecto conectado a Vercel vía GitHub. Al hacer push a `main`, Vercel despliega automáticamente. Las variables de entorno de producción (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_USER_ID`) se configuran en el dashboard de Vercel, no en este repo.
