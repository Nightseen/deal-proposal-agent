---
name: generador-propuestas-comerciales
description: Genera una propuesta comercial nueva (página HTML) para un cliente de ClaryTree Clinics a partir de la grabación de la videollamada de ventas con ese cliente. Transcribe la grabación con diarización (AssemblyAI), analiza a fondo lo que el cliente dijo (requerimientos, deseos, dolores, objeciones, frases textuales, restricciones) y con eso rellena la plantilla de propuestas del proyecto. Usa siempre este skill cuando el usuario mencione crear/armar/generar una propuesta comercial, una nueva propuesta para un cliente, o pida procesar/transcribir la grabación de una llamada o videollamada de ventas — incluso si no nombra el comando explícitamente.
---

# Generador de Propuestas Comerciales

Este skill construye una propuesta comercial completa (página HTML) para un cliente prospecto de ClaryTree Clinics, partiendo de la grabación real de la llamada de ventas con ese cliente. El resultado debe sentirse como si el closer de ventas hubiera escuchado y personalizado cada palabra — no un genérico con el nombre del cliente pegado encima.

Este skill vive dentro del proyecto `agente-propuestas-comerciales`; todos los comandos y rutas de esta guía asumen que la raíz del proyecto es el directorio de trabajo actual.

## Paso 0 — Reunir los datos de entrada

Antes de avanzar necesitas tres cosas. Si el usuario no las dio todas al invocar el skill, pregúntalas (conversacional, no como formulario rígido):

1. **Nombre del cliente** (persona o clínica).
2. **Precio** a poner en la propuesta (puedes aceptarlo como número suelto o ya formateado; si viene solo el número, formatéalo como moneda legible, ej. `$4.200.000 COP`, a menos que el usuario indique otra moneda).
3. **Ubicación del archivo de la grabación** de la videollamada. Si el usuario da solo un nombre de archivo (no una ruta absoluta), asume que está dentro de `Recording commercial calls/` en la raíz del proyecto. Verifica que el archivo exista antes de seguir; si no lo encuentras, pregunta la ruta correcta — no adivines ni sigas sin el archivo real.

No avances al paso 1 hasta tener los tres datos confirmados.

## Paso 1 — Transcribir la grabación

Corre el script de transcripción (usa la API key `ASSEMBLYAI_API_KEY` que ya está en el `.env` del proyecto; el script la carga solo):

```
node .claude/skills/generador-propuestas-comerciales/scripts/transcribe.js "<ruta-al-archivo>"
```

Esto puede tardar varios minutos según la duración de la llamada — es normal, espera a que termine. El script guarda la transcripción en `transcripts/<nombre-archivo>.txt` (carpeta fuera del repo, ya cubierta por `.gitignore`) y también la imprime. Léela completa desde el archivo o la salida antes de seguir.

La transcripción viene diarizada como `[Hablante A]` / `[Hablante B]`, sin saber quién es quién. Determínalo tú por contexto: quien presenta ClaryTree, explica el producto y pregunta por el número de sedes/sillones suele ser el closer; quien responde sobre su propia clínica, precios, o expresa dudas/preocupaciones es el cliente. Si la llamada tiene más de dos personas, identifícalas igual por lo que dicen.

## Paso 2 — Analizar la transcripción a fondo

Lee toda la transcripción con atención — no la resumas por encima — y extrae, en tus propias palabras pero fiel a lo dicho:

- **Requerimientos específicos**: número de sedes, número de profesionales/sillones por sede, especialidades a cubrir o personalizar, si el agente va solo en WhatsApp o también en otras redes, si pidió portal web de auto-gestión, reactivación vía API de WhatsApp, u otros requerimientos puntuales que haya mencionado.
- **Deseos profundos** (opcional): qué sueña lograr el cliente con el servicio, hacia dónde quiere llegar. **Si no lo menciona, omite esta sección por completo — no inventes aspiraciones que el cliente no expresó.**
- **Dolores y frustraciones**: qué le preocupa, qué mala experiencia tuvo antes, qué teme (presupuesto, demoras, sentirse no escuchado, etc.). Si el cliente sí mencionó algo de esto, úsalo tal cual. **Si no mencionó ningún dolor, no inventes uno — usa como respaldo `references/pains-default.md`**, que trae dolores reales tomados de clarytree.com (no inventados), y elige/adapta el que mejor calce con lo que sí sabes del cliente.
- **Objeciones o dudas** que dejó entrever, aunque no las haya dicho como pregunta directa.
- **Frases textuales** del cliente que reflejen su emoción — literalmente sus palabras. Guárdalas para reutilizarlas en el párrafo de entendimiento y/o visión: la gente se convence cuando se siente reflejada en su propio lenguaje, no en lenguaje genérico de venta.
- **Restricciones**: presupuesto, tiempos, integraciones con software externo (ej. el software médico que ya usan), normativa mencionada.

Con todo esto, redacta el contenido de cada sección de la propuesta (ver `references/data-schema.md` para el mapeo exacto campo→placeholder). La propuesta debe sonar hecha a la medida de esta clínica puntual, no un texto genérico con find-and-replace del nombre.

**Tiempos de la sección "Cómo trabajamos" (`fases`)**: por defecto, el tiempo total de implementación (suma de las fases) es de **máximo 1 semana si la clínica es multisede**, o **menos de 1 semana si es unisede** — a menos que la transcripción indique explícitamente otros plazos (ej. el cliente pidió integraciones complejas, o el closer prometió un plazo distinto). Ajusta la cantidad y duración de fases individuales dentro de ese total según lo que tenga sentido para el alcance acordado. Conserva siempre `[NOTA_TIEMPOS]` con la aclaración de que los tiempos son aproximados.

**Antes de construir la propuesta**, revisa si te falta algo imprescindible que la transcripción no cubrió (ej. condiciones de flexibilidad de pago si las hay) y pregúntaselo al usuario. No inventes datos duros (precios, alcance) que nadie te dio — sí puedes redactar libremente el tono/prosa de los párrafos, y aplicar el default de tiempos de arriba si la llamada no especificó plazos. La sección "Por qué confiar en nosotros" es estática (módulo fijo "Resultados comprobados") — no le pidas diferenciadores, garantía, credenciales ni testimonio al usuario, ya no aplican.

## Paso 3 — Construir la propuesta

1. Arma un JSON con el contenido siguiendo exactamente el esquema de `references/data-schema.md`.
2. El `slug` siempre tiene el formato `propuesta-<nombre-cliente-en-kebab-case>` (minúsculas, sin tildes, espacios como guiones — ej. cliente "Clínica Sonrisa Real" → `propuesta-clinica-sonrisa-real`).
3. Guarda ese JSON en un archivo temporal y corre:

   ```
   node .claude/skills/generador-propuestas-comerciales/scripts/build-proposal.js "<ruta-al-json>"
   ```

   El script duplica `plantilla_propuestas.html`, reemplaza todos los placeholders y escribe `<slug>/index.html`. Si falta algún dato obligatorio, el script falla y te dice cuál placeholder quedó sin reemplazar — complétalo y vuelve a correrlo.
4. El script no toca (porque ya son fijos en la plantilla, y así deben quedar): el logo, el CTA de WhatsApp, `NOMBRE_EMPRESA`/`CONTACTO` de la empresa, y el script de notificación por Telegram. Aun así, antes de dar la propuesta por terminada, confirma con un grep rápido que `<slug>/index.html` contiene `data-client-name`, `api/notify` y `wa.me/573115118640` — si por algún motivo faltan, algo salió mal duplicando la plantilla y hay que revisar antes de seguir. La notificación por Telegram **debe** quedar funcional en toda propuesta nueva.

## Paso 4 — Confirmar, subir y responder

1. Haz `git add`, commit y push a `main` (el usuario ya confirmó que esto se hace automático en cada propuesta nueva — no hace falta preguntar cada vez). Usa un mensaje de commit corto que mencione el cliente.
2. Dile al usuario que la propuesta quedó creada y dale el slug final (ej. `propuesta-clinica-sonrisa-real`) para que sepa en qué URL la va a encontrar una vez Vercel la despliegue.

## Notas

- No hay dependencias de npm que instalar — los scripts solo usan Node built-ins (`fetch` nativo de Node 18+).
- Si el archivo de la grabación es un video (mp4, mov, etc.), no hace falta extraer el audio antes: AssemblyAI acepta el archivo directamente.
- Si la transcripción sale vacía o con muy poco contenido (llamada corta, mala calidad de audio), dilo explícitamente al usuario antes de inventar contenido para rellenar huecos.
