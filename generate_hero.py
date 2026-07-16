#!/usr/bin/env python3
"""Genera la imagen lateral del hero ([IMAGEN_HERO]) con Flux (fal.ai) y la
guarda en assets/. Requiere FAL_KEY en el .env del proyecto.

Uso:
  python generate_hero.py [--out-name hero] [--model fal-ai/flux/dev] [--root .] [--prompt "..."]

Dependencia externa (no viene con Node): pip install fal-client
"""

import argparse
import os
import sys
import urllib.request
from pathlib import Path

# Prompt en inglés a propósito: Flux (como la mayoría de modelos de imagen)
# sigue instrucciones con más fidelidad en inglés que en español.
DEFAULT_PROMPT = (
    "A refined, minimalist 3D render of abstract organic shapes resembling "
    "clean tooth structures, soft studio lighting, medical blue and white "
    "color palette, cinematic, high-end dental technology aesthetic, 8k"
)

# fal.ai no interpreta el flag "--ar 16:9" de Midjourney dentro del prompt
# (queda como texto inerte) — el aspect ratio real se fuerza aparte con
# image_size, que sí respeta el modelo.
IMAGE_SIZE = "landscape_16_9"


def load_env(root: Path) -> None:
    env_path = root / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip()


def guess_extension(content_type: str, url: str) -> str:
    if content_type:
        if "png" in content_type:
            return ".png"
        if "webp" in content_type:
            return ".webp"
        if "jpeg" in content_type or "jpg" in content_type:
            return ".jpg"
    suffix = Path(url.split("?")[0]).suffix
    return suffix if suffix else ".jpg"


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera la imagen del hero con Flux (fal.ai).")
    parser.add_argument("--root", default=".", help="Raíz del proyecto (default: directorio actual).")
    parser.add_argument("--out-name", default="hero", help="Nombre de archivo sin extensión (default: hero).")
    parser.add_argument("--model", default="fal-ai/flux/dev", help="Endpoint de Flux en fal.ai (default: fal-ai/flux/dev).")
    parser.add_argument("--prompt", default=DEFAULT_PROMPT, help="Prompt para Flux (en inglés da mejores resultados). Default: prompt de diente/dental.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    load_env(root)

    if not os.environ.get("FAL_KEY"):
        print("Falta FAL_KEY en el .env del proyecto.", file=sys.stderr)
        return 1

    try:
        import fal_client
    except ImportError:
        print("Falta la dependencia fal_client. Instálala con: pip install fal-client", file=sys.stderr)
        return 1

    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"], file=sys.stderr)

    print(f"Generando imagen con {args.model}...", file=sys.stderr)
    result = fal_client.subscribe(
        args.model,
        arguments={
            "prompt": args.prompt,
            "image_size": IMAGE_SIZE,
            "num_images": 1,
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )

    images = result.get("images") or []
    if not images:
        print("Flux no devolvió ninguna imagen.", file=sys.stderr)
        return 1

    image = images[0]
    url = image["url"]
    extension = guess_extension(image.get("content_type", ""), url)

    assets_dir = root / "assets"
    assets_dir.mkdir(exist_ok=True)
    out_path = assets_dir / f"{args.out_name}{extension}"

    print(f"Descargando imagen a {out_path}...", file=sys.stderr)
    urllib.request.urlretrieve(url, out_path)

    print(f"OK: {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
