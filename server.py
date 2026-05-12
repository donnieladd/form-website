import http.server
import io
import gzip
import os
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


class CachingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
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
        print(f"Serving on port {port} with {compression} compression")
        httpd.serve_forever()
