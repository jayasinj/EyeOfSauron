from http.server import HTTPServer, SimpleHTTPRequestHandler

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    httpd = HTTPServer(('localhost', 8000), NoCacheHTTPRequestHandler)
    print("Serving at http://localhost:8000")
    httpd.serve_forever()
