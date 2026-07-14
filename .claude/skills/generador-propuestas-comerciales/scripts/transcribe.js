#!/usr/bin/env node
// Sube un archivo de audio/video a AssemblyAI y devuelve la transcripción
// diarizada (quién dijo qué) en español. Usa ASSEMBLYAI_API_KEY del .env
// del proyecto — no requiere dependencias externas (Node 18+ trae fetch).
//
// Uso:
//   node transcribe.js <ruta-al-archivo> [--root <raiz-proyecto>] [--out <archivo-salida>]
//
// Por defecto --root es el directorio actual y --out es
// transcripts/<nombre-del-archivo-de-audio>.txt (carpeta gitignored).
// Imprime la transcripción formateada por consola y además la guarda en --out.

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') args.root = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

function loadEnv(root) {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function fmtTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

async function upload(apiKey, filePath) {
  const stream = fs.createReadStream(filePath);
  const res = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { authorization: apiKey },
    body: stream,
    duplex: 'half',
  });
  if (!res.ok) {
    throw new Error(`upload falló: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.upload_url;
}

async function requestTranscript(apiKey, audioUrl) {
  const res = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      language_code: 'es',
    }),
  });
  if (!res.ok) {
    throw new Error(`solicitud de transcripción falló: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.id;
}

async function pollTranscript(apiKey, id) {
  const url = `https://api.assemblyai.com/v2/transcript/${id}`;
  while (true) {
    const res = await fetch(url, { headers: { authorization: apiKey } });
    const data = await res.json();
    if (data.status === 'completed') return data;
    if (data.status === 'error') throw new Error(`AssemblyAI error: ${data.error}`);
    await new Promise((r) => setTimeout(r, 4000));
  }
}

function formatTranscript(data) {
  if (data.utterances && data.utterances.length) {
    return data.utterances
      .map((u) => `[Hablante ${u.speaker}] ${fmtTime(u.start)} — ${u.text}`)
      .join('\n');
  }
  return data.text || '';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = args._[0];
  if (!filePath) {
    console.error('Uso: node transcribe.js <ruta-al-archivo> [--root <raiz>] [--out <salida.txt>]');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`No existe el archivo: ${filePath}`);
    process.exit(1);
  }

  const root = path.resolve(args.root || process.cwd());
  loadEnv(root);
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    console.error('Falta ASSEMBLYAI_API_KEY en el .env del proyecto.');
    process.exit(1);
  }

  console.error('Subiendo archivo a AssemblyAI...');
  const uploadUrl = await upload(apiKey, filePath);

  console.error('Solicitando transcripción diarizada (español)...');
  const id = await requestTranscript(apiKey, uploadUrl);

  console.error('Esperando a que termine (puede tardar varios minutos según la duración)...');
  const data = await pollTranscript(apiKey, id);

  const formatted = formatTranscript(data);

  const outPath = path.resolve(
    args.out || path.join(root, 'transcripts', path.basename(filePath, path.extname(filePath)) + '.txt')
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, formatted, 'utf8');

  console.error(`Transcripción guardada en: ${outPath}`);
  console.log(formatted);
}

main().catch((err) => {
  console.error('Fallo la transcripción:', err.message);
  process.exit(1);
});
