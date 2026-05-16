import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
    try {
        // Default to index.html for root path
        let filePath = req.url === '/' ? '/index.html' : req.url;
        
        // Remove query string
        filePath = filePath.split('?')[0];
        
        // Construct full path
        const fullPath = join(__dirname, 'public', filePath);
        
        // Get file extension
        const ext = extname(filePath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        
        // Read and serve file
        const content = await readFile(fullPath);
        
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(content);
        
        console.log(`✓ Served: ${filePath}`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            console.log(`✗ Not found: ${req.url}`);
        } else {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 - Internal Server Error</h1>');
            console.error('Error:', error);
        }
    }
});

server.listen(PORT, () => {
    console.log('\n🚀 DevChronicle Landing Page Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Local:    http://localhost:${PORT}`);
    console.log(`🌐 Network:  http://0.0.0.0:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

// Made with Bob
