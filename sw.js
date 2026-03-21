self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    // Syarat wajib dari Google Chrome (Event fetch harus ada agar bisa di-install)
    // Tidak melakukan cache agar live update terus jalan
});
