# 06. Security & Performance

## Security
1.  **Rate Limiting:**
    - `express-rate-limit` on all routes.
    - Stricter limits on `/auth/*` (e.g., 5 attempts per 15 mins).
2.  **Helmet:**
    - `app.use(helmet())` to set headers like `X-Content-Type-Options`, `X-Frame-Options`.
3.  **Data Sanitization:**
    - Ensure all inputs are validated with Zod (already present, keep it strict).
    - Sanitize HTML input if allowing rich text (prevent XSS).
4.  **JWT Security:**
    - Short expiration (15 mins) for Access Tokens.
    - Long expiration (7 days) for Refresh Tokens (stored in HTTPOnly cookie).

## Performance
1.  **Image Optimization:**
    - Serve images in Next-Gen formats (WebP/AVIF).
    - Use a CDN (Cloudinary, AWS CloudFront).
    - Lazy load off-screen images (`loading="lazy"`).
2.  **Code Splitting:**
    - Vite does this by default, but check bundle size.
    - Use `React.lazy` for heavy routes (e.g., Admin Dashboard).
3.  **Database Indexing:**
    - Ensure `userId`, `businessId`, `status` columns are indexed in Prisma schema (`@@index([userId])`).
4.  **Gzip/Brotli Compression:**
    - Enable compression middleware in Express (`compression` package).
