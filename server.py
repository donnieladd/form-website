import http.server
import io
import gzip
import json
import os
import urllib.request
import urllib.error
from email.utils import formatdate

try:
    import brotli
    BROTLI_AVAILABLE = True
except ImportError:
    BROTLI_AVAILABLE = False

CACHE_LONG = "public, max-age=31536000, immutable"
CACHE_HTML = "no-cache, must-revalidate"

LONG_CACHE_EXTENSIONS = {
    ".avif", ".svg", ".png", ".jpg", ".jpeg", ".webp",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".js", ".css", ".ico",
}

COMPRESSIBLE_EXTENSIONS = {
    ".html", ".css", ".js", ".svg", ".json", ".xml", ".txt", ".ico",
}

# ─── rev. — operational intelligence layer ──────────────────────
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"

REV_SYSTEM_PROMPT = """you are rev. — the operational intelligence layer of form.

form. is an operational intelligence company. it builds the systems beneath strategy, brand, technology, and intelligence — and holds them in coherence as one ecosystem.

core idea: intelligence without structure creates noise. form. is the structure.

the nine entities (always lowercase, always with the trailing period):
- form. strategy — operational architecture, positioning, decision frameworks
- form. creative — brand systems, narrative, visual identity as infrastructure
- form. digital — web, product, digital surfaces as operational extensions
- form. ai — applied intelligence, workflows, operational cognition (you live here)
- form. sound — sonic identity, audio environments, emotional resonance
- form. support — continuous operational backing
- form. experience — physical, spatial, live ecosystems
- form. labs — research and emerging systems
- form. continuum — connective intelligence over time

your role: explain form., guide users, route them to the right entity, recommend pathways, help them understand the philosophy, and qualify conversations naturally. you are not a sales agent. you are not a support widget. you are the intelligence layer.

your voice — non-negotiable:
- always lowercase. periods at the end of phrases. no sentence-case headlines.
- editorial, calm, restrained, intentional. never hype. never enthusiastic.
- short. lots of breathing room. one thought per line when it helps.
- never use emojis. never use exclamation marks. never use the word "exciting".
- never sales-y. never customer-support energy. never ask "how can i help?" — that is widget language.
- you may use a single italicized fragment for emotional punctuation, sparingly. wrap it in <em>…</em>.

routing language — non-negotiable:
- when pointing to action, always say "● start the conversation" — never "book a call", "demo", "consultation", "schedule", "get in touch".
- the dot before "start the conversation" is signal green. always include it as ●.

deprecated terminology — never use these (they are old internal names):
"business systems", "ministry systems", "creative systems", "executive systems", "intelligence systems", "experience systems".

useful links you can recommend (use plain markdown links: [label](/path)):
- vision: /vision.html
- standards: /standards.html
- founder: /founder.html
- ecosystem map: /ecosystem.html
- specific entity anchor: /ecosystem.html#strategy (or creative, digital, ai, sound, support, experience, labs, continuum)
- start the conversation: /contact.html

response shape:
- aim for 2–4 short lines. only go longer when the question genuinely requires it.
- when there is a clear next surface, end with one link.
- do not list every entity unless asked. recommend the one that fits.
- never apologize. never say "as an ai". never refer to yourself as a chatbot or assistant.
"""


def call_openai(messages):
    """Call OpenAI Chat Completions. Returns reply text or raises."""
    if not OPENAI_API_KEY:
        raise RuntimeError("no_api_key")

    payload = {
        "model": OPENAI_MODEL,
        "messages": messages,
        "temperature": 0.6,
        "max_tokens": 320,
        "presence_penalty": 0.2,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        OPENAI_ENDPOINT,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + OPENAI_API_KEY,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"openai_http_{e.code}: {err_body[:200]}")
    except Exception as e:
        raise RuntimeError(f"openai_err: {str(e)[:200]}")

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError):
        raise RuntimeError("openai_bad_response")


class CachingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):

    # ─── /api/rev ────────────────────────────────────────────
    def do_POST(self):
        if self.path.split("?")[0] == "/api/rev":
            self._handle_rev()
            return
        self.send_error(404, "Not found")

    def _send_json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _handle_rev(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b""
            payload = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            self._send_json(400, {"error": "bad_request"})
            return

        history = payload.get("history", [])
        message = (payload.get("message") or "").strip()
        page = (payload.get("page") or "/").strip()

        if not message:
            self._send_json(400, {"error": "empty_message"})
            return
        if not OPENAI_API_KEY:
            self._send_json(503, {"error": "ai_disabled"})
            return

        # Build messages: system + bounded history + current page context + new message
        messages = [{"role": "system", "content": REV_SYSTEM_PROMPT}]
        messages.append({
            "role": "system",
            "content": f"the user is currently on the page: {page}",
        })

        # Keep the last 10 turns to bound token use.
        if isinstance(history, list):
            for turn in history[-10:]:
                role = turn.get("role")
                content = turn.get("content", "")
                if role in ("user", "assistant") and isinstance(content, str) and content:
                    messages.append({"role": role, "content": content[:2000]})

        messages.append({"role": "user", "content": message[:2000]})

        try:
            reply = call_openai(messages)
        except RuntimeError as e:
            print(f"[rev] {e}")
            self._send_json(502, {"error": "upstream"})
            return

        self._send_json(200, {"reply": reply})

    # ─── /api/rev/health ─────────────────────────────────────
    def do_GET(self):
        if self.path.split("?")[0] == "/api/rev/health":
            self._send_json(200, {
                "ai_enabled": bool(OPENAI_API_KEY),
                "model": OPENAI_MODEL if OPENAI_API_KEY else None,
            })
            return

        path = self.translate_path(self.path)

        if os.path.isdir(path):
            index = os.path.join(path, "index.html")
            if os.path.isfile(index):
                path = index
            else:
                super().do_GET()
                return

        _, ext = os.path.splitext(path)
        ext = ext.lower()

        if ext not in COMPRESSIBLE_EXTENSIONS or not os.path.isfile(path):
            super().do_GET()
            return

        accept_encoding = self.headers.get("Accept-Encoding", "")
        use_br = BROTLI_AVAILABLE and "br" in accept_encoding
        use_gz = "gzip" in accept_encoding

        if not (use_br or use_gz):
            super().do_GET()
            return

        try:
            with open(path, "rb") as f:
                data = f.read()
        except OSError:
            self.send_error(404, "File not found")
            return

        if use_br:
            compressed = brotli.compress(data)
            encoding = "br"
        else:
            buf = io.BytesIO()
            with gzip.GzipFile(fileobj=buf, mode="wb") as gz:
                gz.write(data)
            compressed = buf.getvalue()
            encoding = "gzip"

        self.send_response(200)
        ctype = self.guess_type(path)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Encoding", encoding)
        self.send_header("Content-Length", str(len(compressed)))
        self.send_header("Vary", "Accept-Encoding")
        mtime = os.path.getmtime(path)
        self.send_header("Last-Modified", formatdate(mtime, usegmt=True))
        self.end_headers()
        self.wfile.write(compressed)

    def end_headers(self):
        path = self.path.split("?")[0].split("#")[0]
        if path.startswith("/api/"):
            super().end_headers()
            return
        _, ext = os.path.splitext(path)
        ext = ext.lower()

        if ext in LONG_CACHE_EXTENSIONS:
            self.send_header("Cache-Control", CACHE_LONG)
        elif ext == ".html" or ext == "":
            self.send_header("Cache-Control", CACHE_HTML)
        else:
            self.send_header("Cache-Control", CACHE_HTML)

        super().end_headers()

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


if __name__ == "__main__":
    port = 5000
    handler = CachingHTTPRequestHandler
    with http.server.HTTPServer(("0.0.0.0", port), handler) as httpd:
        compression = "gzip + Brotli" if BROTLI_AVAILABLE else "gzip"
        ai_status = f"rev. AI: ON ({OPENAI_MODEL})" if OPENAI_API_KEY else "rev. AI: OFF (canned fallback)"
        print(f"Serving on port {port} with {compression} compression | {ai_status}")
        httpd.serve_forever()
