#!/usr/bin/env python3
"""Zip Publisher: upload a zip of a website and it goes live at /s/<id>/ .

Run:  python3 app.py
Env:  PORT (8000), UPLOAD_TOKEN (if set, required to upload/delete),
      MAX_MB (200), DATA_DIR (./data)
No third-party dependencies.
"""
import json, os, re, secrets, time, zipfile, io, shutil, mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

PORT = int(os.environ.get("PORT", 8000))
TOKEN = os.environ.get("UPLOAD_TOKEN", "")
MAX_BYTES = int(os.environ.get("MAX_MB", 200)) * 1024 * 1024
DATA = Path(os.environ.get("DATA_DIR", Path(__file__).parent / "data"))
FILES = DATA / "sites"
MAX_UNZIPPED = 500 * 1024 * 1024
MAX_ENTRIES = 5000
INDEX = DATA / "index.json"
FILES.mkdir(parents=True, exist_ok=True)
HTML = (Path(__file__).parent / "index.html").read_bytes()


def load():
    try:
        return json.loads(INDEX.read_text())
    except Exception:
        return {}


def save(db):
    tmp = INDEX.with_suffix(".tmp")
    tmp.write_text(json.dumps(db, indent=1))
    tmp.replace(INDEX)


def clean_name(n):
    n = re.sub(r"[^A-Za-z0-9._ -]", "_", os.path.basename(n)).strip(" .") or "file.zip"
    return n if n.lower().endswith(".zip") else n + ".zip"


def extract(data, dest):
    z = zipfile.ZipFile(io.BytesIO(data))
    infos = [i for i in z.infolist() if not i.is_dir() and "__MACOSX/" not in i.filename]
    if not infos or len(infos) > MAX_ENTRIES or sum(i.file_size for i in infos) > MAX_UNZIPPED:
        raise ValueError("zip is empty or too large")
    names = [i.filename for i in infos]
    prefix = ""
    if "index.html" not in names:  # allow a single top-level folder
        tops = {n.split("/")[0] for n in names}
        if len(tops) == 1 and (list(tops)[0] + "/index.html") in names:
            prefix = list(tops)[0] + "/"
        else:
            raise ValueError("zip must contain an index.html at its root")
    base = dest.resolve()
    for i in infos:
        if not i.filename.startswith(prefix):
            continue
        t = (base / i.filename[len(prefix):]).resolve()
        if base not in t.parents:
            raise ValueError("unsafe path in zip")
        t.parent.mkdir(parents=True, exist_ok=True)
        t.write_bytes(z.read(i))


class H(BaseHTTPRequestHandler):
    def send(self, code, body=b"", ctype="application/json", headers=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def js(self, code, obj):
        self.send(code, json.dumps(obj).encode())

    def authed(self):
        return not TOKEN or secrets.compare_digest(self.headers.get("X-Token", ""), TOKEN)

    def do_GET(self):
        p = urlparse(self.path).path
        if p == "/":
            return self.send(200, HTML, "text/html; charset=utf-8")
        if p == "/api/files":
            db = load()
            items = sorted(db.values(), key=lambda x: -x["time"])
            return self.js(200, {"files": items, "auth": bool(TOKEN)})
        m = re.fullmatch(r"/s/([0-9a-f]{12})(/.*)?", p)
        if m:
            if m.group(2) is None:
                return self.send(301, b"", headers={"Location": p + "/"})
            root = (FILES / m.group(1)).resolve()
            rel = unquote(m.group(2)).lstrip("/")
            f = (root / rel).resolve()
            if f.is_dir():
                f = f / "index.html"
            if root not in f.parents or not f.is_file():
                return self.js(404, {"error": "not found"})
            ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
                ctype += "; charset=utf-8"
            return self.send(200, f.read_bytes(), ctype)
        self.js(404, {"error": "not found"})

    def do_PUT(self):
        if urlparse(self.path).path != "/api/upload":
            return self.js(404, {"error": "not found"})
        if not self.authed():
            return self.js(401, {"error": "invalid token"})
        n = int(self.headers.get("Content-Length", 0))
        if n <= 0 or n > MAX_BYTES:
            return self.js(413, {"error": f"size must be 1 byte to {MAX_BYTES // 1048576} MB"})
        data = self.rfile.read(n)
        if not zipfile.is_zipfile(io.BytesIO(data)):
            return self.js(400, {"error": "not a valid zip file"})
        name = clean_name(unquote(self.headers.get("X-Filename", "site.zip")))[:-4]
        fid = secrets.token_hex(6)
        dest = FILES / fid
        try:
            extract(data, dest)
        except ValueError as e:
            shutil.rmtree(dest, ignore_errors=True)
            return self.js(400, {"error": str(e)})
        db = load()
        db[fid] = {"id": fid, "name": name, "size": n, "time": int(time.time()),
                   "url": f"/s/{fid}/"}
        save(db)
        self.js(201, db[fid])

    def do_DELETE(self):
        m = re.fullmatch(r"/api/files/([0-9a-f]{12})", urlparse(self.path).path)
        if not m:
            return self.js(404, {"error": "not found"})
        if not self.authed():
            return self.js(401, {"error": "invalid token"})
        db = load()
        if db.pop(m.group(1), None) is None:
            return self.js(404, {"error": "not found"})
        shutil.rmtree(FILES / m.group(1), ignore_errors=True)
        save(db)
        self.js(200, {"ok": True})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print(f"Zip Publisher on http://0.0.0.0:{PORT}  (token required: {bool(TOKEN)})")
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
