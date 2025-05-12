// Custom Next.js server to handle server-side rendering
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Determine if we're in development or production mode
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Set environment variables for server-side rendering
process.env.NEXT_DISABLE_SSG = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

app.prepare().then(() => {
  createServer((req, res) => {
    // Parse the URL
    const parsedUrl = parse(req.url, true);
    
    // Let Next.js handle the request
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
