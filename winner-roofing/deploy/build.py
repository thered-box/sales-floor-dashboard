#!/usr/bin/env python3
"""Bundle the Winner Roofing dashboard into a single Cloudflare Worker module.

Inlines every site file in winner-roofing/ (HTML, JS, JSON, PNG assets) into
`const FILES = {...}` and prepends it to deploy/worker.js. Output goes to
deploy/dist/worker.js, which is gitignored — never commit build output.

    python3 deploy/build.py          # from winner-roofing/
"""
import base64
import json
import pathlib

SITE = pathlib.Path(__file__).resolve().parent.parent      # winner-roofing/
OUT = SITE / "deploy" / "dist" / "worker.js"

TEXT = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
}
BINARY = {".png": "image/png"}

# Workers accept bundles up to 10 MB (paid) / 3 MB (free) compressed. Warn early.
WARN_BYTES = 2_500_000


def main() -> None:
    files = {}
    for p in sorted(SITE.iterdir()):
        if p.is_file() and p.suffix in TEXT:
            files["/" + p.name] = {"type": TEXT[p.suffix], "body": p.read_text(encoding="utf-8")}
    for p in sorted((SITE / "assets").iterdir()):
        if p.is_file() and p.suffix in BINARY:
            files["/assets/" + p.name] = {
                "type": BINARY[p.suffix],
                "b64": base64.b64encode(p.read_bytes()).decode("ascii"),
            }
    if "/index.html" not in files:
        raise SystemExit("index.html not found next to deploy/")

    worker = (SITE / "deploy" / "worker.js").read_text(encoding="utf-8")
    bundle = "const FILES = " + json.dumps(files, ensure_ascii=False) + ";\n\n" + worker
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(bundle, encoding="utf-8")

    size = len(bundle.encode("utf-8"))
    for path in files:
        print("  +", path)
    print(f"  wrote {OUT.relative_to(SITE)} ({size // 1024} KB)")
    if size > WARN_BYTES:
        print("  ! bundle is large — trim the PNGs in assets/ before deploying")


if __name__ == "__main__":
    main()
