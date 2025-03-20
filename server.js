const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url, true);
    let filePath = '.' + parsedUrl.pathname;
    
    console.log(`Request received: ${req.method} ${parsedUrl.pathname}`);
    
    // Handle OAuth callbacks
    if (parsedUrl.pathname === '/callback' || 
        parsedUrl.pathname === '/oauth-callback') {
        console.log('OAuth callback detected, redirecting to home');
        res.writeHead(302, {
            'Location': '/'
        });
        return res.end();
    }
    
    // Default to index.html if the path is '/'
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Get the extension of the requested file
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // MIME types for different file extensions
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
    };
    
    // Get the content type based on the file extension
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Page not found
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found', 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end('Sorry, there was an error: ' + error.code);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const port = 3001;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Press Ctrl+C to stop');
}); 