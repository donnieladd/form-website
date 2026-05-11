import http.server
import os

CACHE_LONG = "public, max-age=31536000, immutable"
CACHE_HTML = "no-cache, must-revalidate"

LONG_CACHE_EXTENSIONS = {
    ".avif", ".svg", ".png", ".jpg", ".jpeg", ".webp",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".js", ".css", ".ico",
}


class CachingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
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
        print(f"Serving on port {port}")
        httpd.serve_forever()
