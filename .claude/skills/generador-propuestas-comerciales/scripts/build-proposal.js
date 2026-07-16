#!/usr/bin/env node
// Genera una propuesta comercial nueva duplicando plantilla_propuestas.html
// y reemplazando sus placeholders con el contenido de un JSON de entrada.
// No toca el logo, el CTA de WhatsApp, el nombre/contacto fijos de la
// empresa ni el script de notificación por Telegram — esos ya están
// fijos en la plantilla y se preservan tal cual.
//
// Uso:
//   node build-proposal.js <datos.json> [--root <raiz-proyecto>]
//
// Formato esperado de <datos.json> (todos los campos son texto excepto
// los arreglos indicados; ver references/data-schema.md para el detalle):
// {
//   "slug": "propuesta-clinica-sonrisa-real",
//   "fecha": "14 de julio de 2026",
//   "numeroPropuesta": "PROP-2026-002 (opcional, se autogenera si se omite)",
//   "nombreCliente": "...",
//   "parrafoEntendimiento": "...",
//   "parrafoVision": "...",
//   "imagenVision": "https://... (opcional, omitir si no hay)",
//   "alcance": [{ "titulo": "...", "descripcion": "..." }, ...],
//   "exclusiones": ["...", ...],
//   "fases": [{ "nombre": "...", "descripcion": "...", "tiempo": "..." }, ...],
//   "notaTiempos": "...",
//   "precio": "...",
//   "formaDePago": "... (opcional, omitir si no hay flexibilidad de pago)",
//   "parrafoCierre": "...",
//   "textoCta": "..."
// }
//
// La sección 08 ("Por qué confiar en nosotros") es estática (módulo fijo
// "Resultados comprobados") y no toma datos de este JSON.

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') args.root = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

function esc(str) {
  return String(str == null ? '' : str);
}

function nextProposalNumber(root, year) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const count = entries.filter((e) => {
    if (!e.isDirectory() || e.name === 'propuesta-demo' || !e.name.startsWith('propuesta-')) return false;
    return fs.existsSync(path.join(root, e.name, 'index.html'));
  }).length;
  return `PROP-${year}-${String(count + 1).padStart(3, '0')}`;
}

const SCOPE_ICONS = ['icon-check', 'icon-chat', 'icon-calendar', 'icon-chart'];

function buildScopeHtml(items) {
  return items
    .map(
      (item, i) => `<article class="card card--icon scope-card">
            <span class="card__icon"><svg><use href="#${SCOPE_ICONS[i % SCOPE_ICONS.length]}"></use></svg></span>
            <h3 class="scope-card__title">${esc(item.titulo)}</h3>
            <p class="scope-card__desc">${esc(item.descripcion)}</p>
          </article>`
    )
    .join('\n          ');
}

function buildExclusionsHtml(items) {
  return items
    .map(
      (text) => `<li class="card card--icon">
            <span class="card__icon"><svg><use href="#icon-ban"></use></svg></span>
            <h3 class="scope-card__title">${esc(text)}</h3>
          </li>`
    )
    .join('\n        ');
}

function buildPhasesHtml(phases) {
  return phases
    .map(
      (p, i) => `<div class="phase">
            <span class="phase__number">${String(i + 1).padStart(2, '0')}</span>
            <div class="phase__content">
              <h3 class="phase__name">${esc(p.nombre)}</h3>
              <p class="phase__desc">${esc(p.descripcion)}</p>
              <span class="phase__time">${esc(p.tiempo)}</span>
            </div>
          </div>`
    )
    .join('\n          ');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = args._[0];
  if (!dataPath) {
    console.error('Uso: node build-proposal.js <datos.json> [--root <raiz-proyecto>]');
    process.exit(1);
  }

  const root = path.resolve(args.root || process.cwd());
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (!data.slug || !/^propuesta-[a-z0-9-]+$/.test(data.slug)) {
    console.error('El campo "slug" es obligatorio y debe tener el formato propuesta-nombre-cliente (minúsculas, guiones).');
    process.exit(1);
  }

  const templatePath = path.join(root, 'plantilla_propuestas.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  // 1. Quitar el bloque de documentación del inicio (guía para crear
  //    propuestas, no debe aparecer en una propuesta ya terminada).
  html = html.replace(/<!--\n=+\n  PLANTILLA BASE[\s\S]*?=+\n-->\n\n/, '');

  // 2. Capa opcional de imagen de visión: si no se da, se quita entera.
  if (!data.imagenVision) {
    html = html.replace(/\s*<!-- OPCIONAL: si no hay \[IMAGEN_VISION\][\s\S]*?<\/div>\n/, '\n');
  }

  // 2b. Forma de pago opcional: si no se da, se quita el párrafo entero.
  if (!data.formaDePago) {
    html = html.replace(/\s*<!-- OPCIONAL: si no hay \[FORMA_DE_PAGO\][\s\S]*?<\/p>\n/, '\n');
  }

  // 3. Quitar los comentarios-receta antes de reemplazar los bloques
  //    únicos (si no, el placeholder dentro del comentario se
  //    reemplaza primero y el real queda intacto).
  html = html.replace(/<!--\s*\n\s*La IA debe reemplazar \[LISTA_ALCANCE\][\s\S]*?-->\s*\n\s*/, '');
  html = html.replace(/<!-- La IA debe reemplazar \[LISTA_EXCLUSIONES\][\s\S]*?-->\s*\n\s*/, '');
  html = html.replace(/<!--\s*\n\s*La IA debe reemplazar \[FASES\][\s\S]*?-->\s*\n\s*/, '');

  // 4. Placeholders simples
  const simple = {
    FECHA: data.fecha,
    NUMERO_PROPUESTA: data.numeroPropuesta || nextProposalNumber(root, new Date().getFullYear()),
    NOMBRE_CLIENTE: data.nombreCliente,
    PARRAFO_ENTENDIMIENTO: data.parrafoEntendimiento,
    PARRAFO_VISION: data.parrafoVision,
    NOTA_TIEMPOS: data.notaTiempos,
    PRECIO: data.precio,
    PARRAFO_CIERRE: data.parrafoCierre,
    TEXTO_CTA: data.textoCta,
  };
  if (data.imagenVision) simple.IMAGEN_VISION = data.imagenVision;
  if (data.formaDePago) simple.FORMA_DE_PAGO = data.formaDePago;

  for (const [key, value] of Object.entries(simple)) {
    const token = `[${key}]`;
    if (value == null) continue;
    html = html.split(token).join(value);
  }

  // 5. Bloques únicos (HTML completo)
  html = html.replace('[LISTA_ALCANCE]', buildScopeHtml(data.alcance || []));
  html = html.replace('[LISTA_EXCLUSIONES]', buildExclusionsHtml(data.exclusiones || []));
  html = html.replace('[FASES]', buildPhasesHtml(data.fases || []));

  // Un placeholder real siempre empieza con letra mayúscula ([FECHA], etc.).
  // Exigirlo evita falsos positivos con índices de array del JS embebido en la
  // plantilla (p[0], s[1], path[0]), que si no se confundirían con placeholders.
  const remaining = html.match(/\[[A-Z][A-Z_0-9]*\]/g);
  if (remaining) {
    console.error('Placeholders sin reemplazar (faltan datos en el JSON):', remaining.join(', '));
    process.exit(1);
  }

  const outDir = path.join(root, data.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`OK: ${path.relative(root, outPath)} (${html.length} caracteres)`);
}

main();
