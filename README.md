# Z2A Store — React + Node.js + MongoDB

Bilingual (English / Arabic) online store: React website, Express API, MongoDB database,
admin dashboard with roles, photos for products and categories, 3D hero and welcome animation.

## 1. Run it (development)

You need **Node.js 20+** and a **MongoDB** (pick one):

| MongoDB option | Command / value |
|---|---|
| Docker (easiest) | `docker compose up -d mongo` → default `.env` works |
| Installed on your PC | start the MongoDB service → default `.env` works |
| MongoDB Atlas (cloud, free tier) | put your connection string in `MONGODB_URI` |

```bash
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm run dev                 # API on :5000  +  website on http://localhost:5173
```

Open **http://localhost:5173**. On the first start the empty database is filled with demo categories/products.
**The first account you create becomes the Owner** (or set `OWNER_EMAIL` in `.env`).

## 2. Launch it (production)

```bash
npm install
npm run build               # builds the website into dist/
# in .env:  NODE_ENV=production  and a long random JWT_SECRET  (the server refuses to start without it)
npm start                   # one process: API + website on http://localhost:5000
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**Docker (website + MongoDB together):**
```bash
echo "JWT_SECRET=$(node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")" > .env
echo "OWNER_EMAIL=you@example.com" >> .env
docker compose up --build -d       # http://localhost:5000
```
Put it behind https (Nginx / Caddy / Cloudflare / Render / Railway) and set `COOKIE_SECURE=true` and `TRUST_PROXY=true`.
In production no demo data is created automatically; run `npm run seed` once if you want it.

## 3. Environment variables (`.env`)

| Name | Meaning |
|---|---|
| `MONGODB_URI` | MongoDB connection string (default `mongodb://127.0.0.1:27017/z2a`) |
| `PORT` | server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | signs login cookies — **required in production** |
| `OWNER_EMAIL` | this email becomes Owner when it registers (empty = first account) |
| `SEED_DEMO` | fill an empty database with demo data (default: on in development, off in production) |
| `COOKIE_SECURE` | https-only cookies (default: on in production; use `false` only for plain-http tests) |
| `TRUST_PROXY` | `true` behind a proxy / load balancer |

## 4. What is where

```
server/            Node.js + Express + Mongoose API
  index.js app.js config.js db.js seed.js
  models/          User, Category, Product, Order, Image, Counter
  routes/          auth, catalog (categories+products), orders, users, uploads, admin
  middleware/      auth (cookie + roles), security (CSRF check, errors)
  tests/           npm test  (needs a MongoDB; uses database z2a_test)
src/               React app (App.jsx, StoreProvider.jsx = talks to the API, api.js, i18n.js, CSS)
Layers/            pages & components (Navb, Hero, Hero3D, Welcome, Auth, Categories, admin/ ...)
public/Img/        logo files (logo.png = original, logo-mark.png / logo-badge.png = cropped)
```

## 5. Features of this version
- **Database:** everything (categories, products, users, orders, photos) lives in MongoDB. Stock is decremented atomically, so two buyers can never buy the last item; cancelling an order returns the stock once.
- **Accounts:** register / login on their own pages (`/login`, `/register`), bcrypt-hashed passwords, httpOnly cookie session, roles **owner / admin / user** enforced on the server.
- **Photos instead of icons** for products and categories, everywhere (cards, slider, product page, cart, checkout, admin). Upload from the dashboard; photos are resized in the browser and stored in MongoDB. Without a photo the Z2A logo is shown.
- **Welcome animation** (3D "Welcome to Z2A") on the first visit of each session, click to skip.
- **Category slider moves by itself** in a seamless loop, pauses on hover/touch, still has arrows and drag.
- **3D logo banner** in the hero (layered 3D logo, orbit rings, follows the mouse). Respects "reduce motion".
- CSS fixed for laptops/PCs (no sideways scroll at 1024 / 1280 / 1440 / 1920 / phones).

## 6. Security notes
Helmet headers + CSP, rate limit on login/register, cross-site write requests refused, inputs validated on the server,
prices and stock always taken from the database (never from the browser), uploads accept only real JPG/PNG/WebP files (SVG refused).
Before going live: set a strong `JWT_SECRET`, use https, back up MongoDB.

## 7. Scripts
`npm run dev` · `npm run build` · `npm start` · `npm run seed` (`seed:force` replaces products/categories) · `npm test` · `npm run lint`
