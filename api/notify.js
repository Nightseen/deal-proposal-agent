// Vercel Serverless Function (Node runtime).
// Envía por Telegram el aviso de que un cliente abrió una propuesta.
// El bot token y el chat id viven SOLO aquí (variables de entorno del
// servidor) — nunca se exponen al HTML/cliente. Ver CLAUDE.md.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_USER_ID;

  if (!token || !chatId) {
    console.error('notify: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_USER_ID en las variables de entorno');
    res.status(500).json({ ok: false, error: 'missing_config' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const cliente = String(body.cliente || 'un cliente').slice(0, 200);
  const text = `El cliente ${cliente} acaba de abrir la propuesta comercial`;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await telegramRes.json();

    if (!data.ok) {
      console.error('notify: Telegram respondió con error', data);
      res.status(502).json({ ok: false, error: 'telegram_error' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify: fallo al llamar a Telegram', err);
    res.status(500).json({ ok: false, error: 'request_failed' });
  }
};
