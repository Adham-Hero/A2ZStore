# Z2A Store — Vercel deployment

This folder is adapted for Vercel serverless deployment while keeping the original local/Railway entrypoint (`server/index.js`).

## Before deploy

1. **Rotate the MongoDB credentials and JWT secret.** The original `.env.example` contained credential-looking values. Do not reuse them; create a new MongoDB Atlas database user/password and a fresh JWT secret.
2. Confirm MongoDB Atlas Network Access allows Vercel connections (for quick setup, Atlas IP allow-list may be set to `0.0.0.0/0`; use a strong DB password and least-privilege database user).
3. Push this folder's contents to a GitHub repo (or update your existing repo with these changes).

## Vercel setup

1. Import the repository in Vercel.
2. Framework preset: **Vite** (or leave automatic detection).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Root directory: project root (where package.json is located).
6. In **Settings → Environment Variables**, add:
   - `MONGODB_URI` — new MongoDB Atlas connection URI, including the database name.
   - `JWT_SECRET` — generate a new long random secret (at least 32 characters).
   - `NODE_ENV` — `production`.
   - `TRUST_PROXY` — `true`.
   - `SEED_DEMO` — optional, normally `false`; set `true` only if you want demo data inserted when both categories/products are empty.
   - `OWNER_EMAIL` — optional, the email that will become Owner on registration.
7. Deploy.


## API verification

After deployment, open `/api/health`. It should return JSON such as `{"ok":true,"db":true}`. If it returns `db:false` or a 503, check the Atlas URI and Atlas Network Access.

## Notes

- The API is served from Vercel Functions via `api/index.js`.
- The frontend is built to `dist`; Vercel serves the static assets and the rewrite sends non-API routes to `index.html` for React Router.
- Uploaded product images are stored in MongoDB, not the function filesystem, so they persist between deployments.
- The Vercel function has a request-size limit; image uploads larger than Vercel's platform request limit can fail even though the app's Multer limit is 5 MB. If uploads fail, use smaller images or move uploads to a dedicated object-storage service.
- `server/index.js` remains unchanged for local and traditional Node hosting.
