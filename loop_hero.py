#!/usr/bin/env python3
"""Convierte un video del hero en un loop "boomerang" sin corte: reproduce el
video hacia adelante y luego en reversa, concatenados. Como el segmento en
reversa termina exactamente en el primer frame del original, el punto de loop
siempre calza y no hay salto brusco al reiniciar.

Usa el ffmpeg estático que trae imageio-ffmpeg (no requiere ffmpeg del sistema
ni permisos de admin). Instálalo con: pip install imageio-ffmpeg

Uso:
  python loop_hero.py [entrada] [--out <salida.mp4>]

  [entrada]  Video de origen (default: assets/hero-v6-animated.mp4).
  --out      Video de salida (default: assets/hero-v6-loop.mp4).
"""

import argparse
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Crea un loop boomerang sin corte de un video del hero.")
    parser.add_argument("entrada", nargs="?", default="assets/hero-v6-animated.mp4", help="Video de origen (default: assets/hero-v6-animated.mp4).")
    parser.add_argument("--out", default="assets/hero-v6-loop.mp4", help="Video de salida (default: assets/hero-v6-loop.mp4).")
    args = parser.parse_args()

    in_path = Path(args.entrada).resolve()
    out_path = Path(args.out).resolve()
    if not in_path.exists():
        print(f"No existe el video de origen: {in_path}", file=sys.stderr)
        return 1

    try:
        import imageio_ffmpeg
    except ImportError:
        print("Falta la dependencia imageio-ffmpeg. Instálala con: pip install imageio-ffmpeg", file=sys.stderr)
        return 1

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    # [0:v]reverse[r] -> genera la versión en reversa; luego concatena
    # adelante + reversa. Sin audio (-an): el fondo del hero va muted igual.
    # yuv420p + libx264 para máxima compatibilidad de reproducción en web.
    cmd = [
        ffmpeg, "-y", "-i", str(in_path),
        "-filter_complex", "[0:v]reverse[r];[0:v][r]concat=n=2:v=1:a=0[v]",
        "-map", "[v]", "-an",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(out_path),
    ]

    print(f"Generando loop boomerang: {in_path.name} -> {out_path.name}...", file=sys.stderr)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr[-2000:], file=sys.stderr)
        print("ffmpeg falló.", file=sys.stderr)
        return 1

    print(f"OK: {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
