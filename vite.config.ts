import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const shapesFilePath = path.resolve(__dirname, 'shapes.json');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'shapes-file-backend',
      configureServer(server) {
        server.middlewares.use('/api/shapes', (req, res) => {
          if (req.method === 'GET') {
            if (fs.existsSync(shapesFilePath)) {
              try {
                const data = fs.readFileSync(shapesFilePath, 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              } catch (err) {
                console.error('Error reading shapes.json:', err);
              }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ elements: [] }));
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                fs.writeFileSync(shapesFilePath, body, 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                console.error('Error writing shapes.json:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: String(err) }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ],
  base: './',
  build: {
    outDir: 'dist/webview',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});
