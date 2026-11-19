# Screenshot runner for the Neon Coast cover studio. Usage (server started by with_server.py):
#   ~/workspace/taki-tools/venv/bin/python ~/workspace/custom-skills/webapp-testing/scripts/with_server.py \
#     --server "node serve.ts --port 8080" --port 8080 -- python shoot.py
# Run from the build directory. Writes screenshots/*.jpg (JPEG q80, <=256 KiB).
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
SHOTS = json.loads((ROOT / "shots.json").read_text())
OUT = ROOT / "screenshots"
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="/home/hatch/.cache/ms-playwright/chromium-1148/chrome-linux/chrome",
        args=["--no-sandbox"], headless=True)
    errors = []
    for shot in SHOTS:
        page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
        page.on("console", lambda m: errors.append(f"{shot['name']} console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(f"{shot['name']} pageerror: {e}"))
        page.goto(f"http://localhost:8080/{shot['query']}")
        try:
            page.wait_for_function("window.__shotReady === true", timeout=20000)
        except Exception as e:
            errors.append(f"{shot['name']} TIMEOUT waiting for __shotReady: {e}")
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / shot["name"]), type="jpeg", quality=80)
        print(shot["name"], (OUT / shot["name"]).stat().st_size, "bytes")
        page.close()
    browser.close()
print("ERRORS:" if errors else "no console/page errors")
for e in errors:
    print(" -", e)
