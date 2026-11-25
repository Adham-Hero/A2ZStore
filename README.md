# Z2A Store (React + Vite)

Bilingual (EN / AR, RTL) storefront with cart, checkout and an admin dashboard.
See `FUNCTIONS.txt` (Arabic) for a full explanation of every main function.

```bash
npm install
npm run dev      # development
npm run build    # production build -> dist/
npm run lint
```

## What the notes asked for, and where it is
| Note | Done in |
|---|---|
| Logo in `public/Img`, used everywhere + San Francisco font | `public/Img/logo-*.png`, `Layers/Logo.jsx`, `src/index.css` |
| Logo at the top-right | `Layers/Navb.jsx`, `.nav__inner` in `src/App.css` |
| Categories in the nav opens a page of categories; a category opens its products | `Layers/caregores.jsx` (`/categories`, `/categories/:id`) |
| Product card with View + Add to cart | `Layers/prodectscard.jsx` |
| Product (item) page | `Layers/prodact.jsx` (`/product/:id`) |
| Checkout | `Layers/chiickout.jsx` (`/checkout`) |
| Admin: add product, price before/after discount, stock number, in/out of stock, photo, new category | `Layers/admin/AdminProducts.jsx`, `AdminCategories.jsx` |
| Admin: manage users, 3 roles (owner / admin / user) | `Layers/admin/AdminUsers.jsx`, `src/StoreProvider.jsx` |
| Admin: orders with date, number and details | `Layers/admin/AdminOrders.jsx` |

## Extra improvements
- Real sign in / create account (first account becomes **Owner**; passwords are salted + hashed).
- Cart and all data survive page refresh; cart respects stock; stock drops on order and returns on cancel.
- Shop page with search + category filter, "My orders" page, discount badges, related products, toasts, 404 page.
- Admin overview (stats, low stock), order status workflow, order search, dashboard is lazy-loaded.
- Fixed `Foot.jsx` import case, removed unused Vite template files, new favicon, page title `Z2A`.

## Important
Data lives in `localStorage` (this browser only) — it is a working demo, not a real backend.
Before going live, move data/auth/orders to a server (details in `FUNCTIONS.txt`, section 9).
When deploying, configure an SPA fallback so `/shop`, `/admin`… work after refresh.
