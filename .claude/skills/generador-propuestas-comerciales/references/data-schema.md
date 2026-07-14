# Esquema del JSON para build-proposal.js

Mapeo de cada campo del JSON al placeholder que reemplaza en `plantilla_propuestas.html`. Todos son string excepto donde se indica arreglo.

| Campo JSON | Placeholder | Notas |
|---|---|---|
| `slug` | (nombre de carpeta) | Formato `propuesta-nombre-cliente`, minúsculas, guiones, sin tildes. Obligatorio. |
| `fecha` | `[FECHA]` | Fecha de la propuesta. |
| `tipoDeServicio` | `[TIPO_DE_SERVICIO]` | Ej. "Automatización de Atención al Paciente con IA". |
| `nombreCliente` | `[NOMBRE_CLIENTE]` y `data-client-name` | Mismo valor en ambos lugares automáticamente. |
| `nombreProyecto` | `[NOMBRE_PROYECTO]` | Alias corto del proyecto. |
| `parrafoEntendimiento` | `[PARRAFO_ENTENDIMIENTO]` | Bloque único — párrafo completo. |
| `parrafoVision` | `[PARRAFO_VISION]` | Bloque único — párrafo completo. |
| `imagenVision` | `[IMAGEN_VISION]` | Opcional. Si se omite (no incluir la clave o dejarla vacía/null), el script quita toda la capa de parallax de la sección de visión. |
| `alcance` | `[LISTA_ALCANCE]` | Arreglo de `{ "titulo": "...", "descripcion": "..." }`, 4–8 ítems recomendado. |
| `exclusiones` | `[LISTA_EXCLUSIONES]` | Arreglo de strings. |
| `fases` | `[FASES]` | Arreglo de `{ "nombre": "...", "descripcion": "...", "tiempo": "..." }`. El número de fase (01, 02...) se genera solo según el orden del arreglo. |
| `notaTiempos` | `[NOTA_TIEMPOS]` | Aclaración de que los tiempos son aproximados. |
| `precio` | `[PRECIO]` | Ya formateado como texto a mostrar (ej. `"$4.200.000 COP"`). |
| `formaDePago` | `[FORMA_DE_PAGO]` | Ej. "50% para iniciar, 50% contra entrega". |
| `diferenciadores` | `[DIFERENCIADOR_1/2/3]` | Arreglo de exactamente 3 strings. |
| `garantia` | `[GARANTIA]` | Garantía o política de revisiones. |
| `credenciales` | `[CREDENCIALES]` | Opcional. |
| `testimonio` | `[TESTIMONIO]` | Opcional. Si tanto `credenciales` como `testimonio` se omiten, el script quita todo el bloque opcional de la sección 08. |
| `parrafoCierre` | `[PARRAFO_CIERRE]` | Bloque único. |
| `textoCta` | `[TEXTO_CTA]` | Texto del botón final (ej. "Hablemos por WhatsApp"). |

Campos que **no** van en este JSON porque ya son fijos en la plantilla (no se tocan): logo, `NOMBRE_EMPRESA` ("ClaryTree Clinics"), `CONTACTO` (contacto.clarytree@gmail.com), el WhatsApp del CTA final, y el script de notificación por Telegram.
