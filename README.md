# Store Website (React + Vite)

A responsive, bilingual (English / Arabic) storefront built from the structure and notes
found in your project files (`Navb.jsx`, `Hero.jsx`, `Foot.jsx`).

## Run it

```bash
npm install
npm run dev      # development
npm run build    # production build -> dist/
npm run lint
```

## What I did

### Followed the notes in your files
| Note in your file | What I built | Where |
|---|---|---|
| Navbar: Home, Shop, Categories, About Us, Contact Us | Sticky navbar with all 5 links (smooth-scroll to sections) | `Layers/Navb.jsx` |
| Light / dark mode button | Toggle, remembered between visits, defaults to the device setting | `Navb.jsx`, `src/AppProvider.jsx` |
| Arabic / English button | Switches all text and flips the layout to RTL / LTR | `Navb.jsx`, `src/i18n.js` |
| Sign in button | Button in the navbar and hero opens a sign-in popup | `Layers/SignInModal.jsx` |
| Cart "to check what you pay" | Cart icon with item count, slide-in drawer with quantities, remove and live total | `Layers/CartDrawer.jsx` |
| Colours | Exactly your 6 colours as CSS variables (Navy `#04162E`, Ivory `#F7F5F0`, White `#FFFFFF`, Gold `#C5A880`, Slate `#1E3A5F`, Muted `#8A99AD`) | `src/index.css` |
| Responsive for phone, laptop, PC | Mobile menu (burger), fluid grids, slider and footer adapt to screen size | `src/App.css` |
| Hero with logo, Shop button, Sign in button | Hero section in your colours with both buttons and a logo spot | `Layers/Hero.jsx` |
| Categories shown as a slider after the hero | Scrollable, snap slider with previous / next buttons (works in RTL too) | `Layers/Categories.jsx` |
| Latest offers | Offer cards with discount badge, old/new price and "Add to cart" (feeds the cart) | `Layers/Offers.jsx` |
| Contact us section | Contact details plus a message form | `Layers/Contact.jsx` |
| Footer: social icons, copyright, e-mail, phone | Facebook / Instagram / X / WhatsApp icons, auto-updating year, mailto and tel links | `Layers/Foot.jsx` |

### Extra things I added
- **About Us section** (`Layers/About.jsx`), because the navbar has an "About Us" link and needed somewhere to go.
- Shared state (theme, language, cart, popups) in `src/AppProvider.jsx` and `src/AppContext.js`.
- Small inline icon set (`Layers/Icons.jsx`), so no extra packages are needed.

### Fixed / cleaned
- `App.jsx` imported `../Layers/foot.jsx` but the file is `Foot.jsx`. This breaks on Linux and in production builds, so I fixed the case.
- Removed a duplicate import of `Navb.jsx` in `App.jsx`.
- Removed unused Vite template files (`hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`) and replaced the default favicon.
- Replaced the template README with this one.
- Page title is now "Your Brand" instead of "vite-project".

## Placeholders to replace
- **Logo:** replace `src/assets/logo.svg` (and `public/favicon.svg`). It updates everywhere. I used a simple gold "L" monogram until you share yours.
- **Brand name:** `brand` in `src/i18n.js` (both languages).
- **Products, categories, prices, phone, email:** `src/data.js`. Prices are in EGP.
- **Social links:** `socials` array in `Layers/Foot.jsx`.
- **Texts (English and Arabic):** `src/i18n.js`.

## Not connected yet
These are front-end only for now:
- Sign-in form, contact form and "Checkout" have no backend; connect them to your API / email / payment service.
- Cart is kept in memory, so it resets on page refresh.
- Categories and offers use emoji icons instead of product photos.

## Notes
- Light mode uses Slate Blue for secondary text because Muted `#8A99AD` is too faint on Ivory; Muted is used in dark mode and the footer.
- Verified: `npm run build` and `npm run lint` pass with no errors. I have not tested it visually in a browser, so check the look on your phone and laptop.

## Structure
```
Layers/            Navb, Hero, Categories, Offers, About, Contact, Foot, CartDrawer, SignInModal, Logo, Icons
src/
  App.jsx          page layout
  AppProvider.jsx  theme, language, cart state
  data.js          categories, offers, contact info
  i18n.js          English / Arabic texts
  index.css        colour tokens, light/dark themes
  App.css          component styles
public/favicon.svg
```
