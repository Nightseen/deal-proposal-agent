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
//   "tipoDeServicio": "...",
//   "nombreCliente": "...",
//   "nombreProyecto": "...",
//   "parrafoEntendimiento": "...",
//   "parrafoVision": "...",
//   "imagenVision": "https://... (opcional, omitir si no hay)",
//   "alcance": [{ "titulo": "...", "descripcion": "..." }, ...],
//   "exclusiones": ["...", ...],
//   "fases": [{ "nombre": "...", "descripcion": "...", "tiempo": "..." }, ...],
//   "notaTiempos": "...",
//   "precio": "...",
//   "formaDePago": "...",
//   "diferenciadores": ["...", "...", "..."],
//   "garantia": "...",
//   "credenciales": "... (opcional)",
//   "testimonio": "... (opcional)",
//   "parrafoCierre": "...",
//   "textoCta": "..."
// }

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

function buildScopeHtml(items) {
  return items
    .map(
      (item) => `<article class="card scope-card">
            <h3 class="scope-card__title">${esc(item.titulo)}</h3>
            <p class="scope-card__desc">${esc(item.descripcion)}</p>
          </article>`
    )
    .join('\n          ');
}

function buildExclusionsHtml(items) {
  return items.map((text) => `<li class="exclusion-item">${esc(text)}</li>`).join('\n        ');
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

  // 3. Quitar los comentarios-receta antes de reemplazar los bloques
  //    únicos (si no, el placeholder dentro del comentario se
  //    reemplaza primero y el real queda intacto).
  html = html.replace(/<!--\s*\n\s*La IA debe reemplazar \[LISTA_ALCANCE\][\s\S]*?-->\s*\n\s*/, '');
  html = html.replace(/<!-- La IA debe reemplazar \[LISTA_EXCLUSIONES\][\s\S]*?-->\s*\n\s*/, '');
  html = html.replace(/<!--\s*\n\s*La IA debe reemplazar \[FASES\][\s\S]*?-->\s*\n\s*/, '');

  // 4. Placeholders simples
  const simple = {
    FECHA: data.fecha,
    TIPO_DE_SERVICIO: data.tipoDeServicio,
    NOMBRE_CLIENTE: data.nombreCliente,
    NOMBRE_PROYECTO: data.nombreProyecto,
    PARRAFO_ENTENDIMIENTO: data.parrafoEntendimiento,
    PARRAFO_VISION: data.parrafoVision,
    NOTA_TIEMPOS: data.notaTiempos,
    PRECIO: data.precio,
    FORMA_DE_PAGO: data.formaDePago,
    DIFERENCIADOR_1: data.diferenciadores && data.diferenciadores[0],
    DIFERENCIADOR_2: data.diferenciadores && data.diferenciadores[1],
    DIFERENCIADOR_3: data.diferenciadores && data.diferenciadores[2],
    GARANTIA: data.garantia,
    CREDENCIALES: data.credenciales,
    TESTIMONIO: data.testimonio,
    PARRAFO_CIERRE: data.parrafoCierre,
    TEXTO_CTA: data.textoCta,
  };
  if (data.imagenVision) simple.IMAGEN_VISION = data.imagenVision;

  for (const [key, value] of Object.entries(simple)) {
    const token = `[${key}]`;
    if (value == null) continue;
    html = html.split(token).join(value);
  }

  // 5. Bloques únicos (HTML completo)
  html = html.replace('[LISTA_ALCANCE]', buildScopeHtml(data.alcance || []));
  html = html.replace('[LISTA_EXCLUSIONES]', buildExclusionsHtml(data.exclusiones || []));
  html = html.replace('[FASES]', buildPhasesHtml(data.fases || []));

  // 6. Si no hubo credenciales/testimonio, quitar el bloque opcional entero
  if (!data.credenciales && !data.testimonio) {
    html = html.replace(/\s*<!-- OPCIONAL: eliminar este bloque si no aplica -->[\s\S]*?<\/div>\n/, '\n');
  }

  const remaining = html.match(/\[[A-Z_0-9]+\]/g);
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
