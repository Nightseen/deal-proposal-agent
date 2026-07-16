#!/usr/bin/env python3
"""Anima una imagen del hero (Image-to-Video) con Kling (fal.ai) y guarda el
.mp4 en assets/. Requiere FAL_KEY en el .env del proyecto.

Flujo:
  1. Sube la imagen local a fal.ai con fal_client.upload_file() -> URL pública temporal.
  2. Llama al endpoint de Kling (fal-ai/kling-video/v1/standard/image-to-video)
     con fal_client.subscribe() y la configuración de movimiento optimizada.
  3. Descarga el video resultante (result["video"]["url"]) a assets/.

Uso:
  python animate_hero.py [imagen] [--out <ruta.mp4>] [--duration 5|10] [--root .]

  [imagen]    Ruta a la imagen de origen (default: assets/hero-v6.jpg).
  --out       Ruta de salida del .mp4 (default: assets/hero-animated.mp4).
  --duration  Segundos del video; Kling solo acepta 5 o 10 (default: 5).

Dependencia externa (no viene con Node): pip install fal-client
"""

import argparse
import os
import sys
import urllib.request
from pathlib import Path

# Prompt en inglés a propósito: Kling (como la mayoría de modelos) sigue las
# instrucciones con más fidelidad en inglés que en español.
PROMPT = (
    "A slow, smooth cinematic camera pan from right to left. The organic, "
    "fluid blue and white 3D structures gently drift across the frame, "
    "strictly maintaining their clean, glossy liquid shapes with no morphing, "
    "no twisting, and no distortion. Motion strength is ultra-low and "
    "controlled, executing a subtle, elegant horizontal glide. Perfect "
    "seamless loop for a high-end tech interface."
)

MODEL = "fal-ai/kling-video/v1/standard/image-to-video"


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


def main() -> int:
    parser = argparse.ArgumentParser(description="Anima la imagen del hero con Kling (fal.ai).")
    parser.add_argument("image", nargs="?", default="assets/hero-v6.jpg", help="Imagen de origen (default: assets/hero-v6.jpg).")
    parser.add_argument("--out", default="assets/hero-animated.mp4", help="Ruta de salida del .mp4 (default: assets/hero-animated.mp4).")
    parser.add_argument("--duration", default="5", choices=["5", "10"], help="Duración del video en segundos (Kling solo acepta 5 o 10; default: 5).")
    parser.add_argument("--root", default=".", help="Raíz del proyecto (default: directorio actual).")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    load_env(root)

    if not os.environ.get("FAL_KEY"):
        print("Falta FAL_KEY en el .env del proyecto.", file=sys.stderr)
        return 1

    image_path = Path(args.image)
    if not image_path.is_absolute():
        image_path = root / image_path
    if not image_path.exists():
        print(f"No existe la imagen de origen: {image_path}", file=sys.stderr)
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

    print(f"Subiendo {image_path.name} a fal.ai...", file=sys.stderr)
    image_url = fal_client.upload_file(str(image_path))

    print(f"Generando video con {MODEL} (puede tardar varios minutos)...", file=sys.stderr)
    result = fal_client.subscribe(
        MODEL,
        arguments={
            "image_url": image_url,
            "prompt": PROMPT,
            "motion_strength": 0.2,
            "loop": True,
            "duration": args.duration,
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )

    video = result.get("video") or {}
    video_url = video.get("url")
    if not video_url:
        print("Kling no devolvió ningún video.", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = root / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Descargando video a {out_path}...", file=sys.stderr)
    urllib.request.urlretrieve(video_url, out_path)

    print(f"OK: {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
