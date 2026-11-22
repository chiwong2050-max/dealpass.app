import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import authRoutes from './routes/auth';
import offerRoutes from './routes/offers';
import businessRoutes from './routes/businesses';
import settingsRoutes from './routes/settings';
import supportRoutes from './routes/support';
import notificationRoutes from './routes/notifications';
import { ApiError } from './utils/errors';

const app = express();

// Trust the first hop (nginx reverse proxy) so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// Path to the built frontend (Vite output).
// Resolves to <project-root>/dist for both src/app.ts (dev) and dist/app.js (build).
const distPath = path.resolve(__dirname, '../../dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const serveFrontend = fs.existsSync(indexHtmlPath);

const siteUrl = config.siteUrl.replace(/\/+$/, '');

// Security Middleware
// Allow images from https URLs (business logos / deal images) and inline data URIs.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter); // Apply to all requests

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

// SEO: robots.txt and sitemap.xml are generated from SITE_URL
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const staticPaths = ['/', '/offers', '/about', '/terms', '/agent-program', '/login', '/signup'];
  const urls = staticPaths
    .map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`)
    .join('\n');
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/businesses', businessRoutes); // Use business routes
app.use('/api/settings', settingsRoutes); // Use settings routes
app.use('/api/support', supportRoutes); // Use support routes
app.use('/api/notifications', notificationRoutes); // Use notification routes

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'DealPass backend is running!' });
});

// Catch-all for undefined API routes
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// In production, serve the built frontend and fall back to index.html for SPA routes.
// The SITE_URL placeholder in index.html is replaced at runtime so canonical/OG
// links stay in sync with the SITE_URL environment variable.
if (serveFrontend) {
  app.use(express.static(distPath, { index: false }));

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    fs.readFile(indexHtmlPath, 'utf8', (err, html) => {
      if (err) return next(err);
      const withSiteUrl = html.replace(/__SITE_URL__/g, siteUrl);
      res.type('html').send(withSiteUrl);
    });
  });
}

// Catch-all for undefined routes (when no frontend build is present)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const startServer = () => {
  app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
    console.log(`Access health check at http://localhost:${config.port}/api/health`);
    if (serveFrontend) {
      console.log(`Serving built frontend from ${distPath}`);
    }
  });
};

if (require.main === module) {
  startServer();
}

export default app;
