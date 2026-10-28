# Northstar — Multi-page E-commerce Store

A responsive frontend shopping-cart project built with **HTML, CSS, and vanilla JavaScript**. Designed as a portfolio project to demonstrate product browsing, search/filter/sort, wishlist, cart management, and a simulated checkout flow.

## Pages
- `index.html` — Landing page, categories, featured products, newsletter demo
- `shop.html` — Product catalogue, search, category/price/rating filters, sorting
- `product.html` — Individual product detail page and related products
- `wishlist.html` — Saved products
- `cart.html` — Quantity controls, remove/clear items, shipping threshold and totals
- `checkout.html` — Validated demo checkout form
- `orders.html` — Demo order history
- `login.html` — Simulated sign-in/sign-up interface

## Run locally
1. Download and extract the ZIP.
2. Open the `Northstar-Shop` folder in VS Code.
3. Open `index.html` in your browser, or use the **Live Server** extension and choose **Open with Live Server**.
4. Add items to the cart, save wishlist items, and place a demo order.

No build tools or npm packages are required. Product images and Google Fonts are loaded from the internet.

## Data storage
Cart, wishlist, demo profile, and demo orders are stored in browser `localStorage`. They are local to the current browser and are not synced between devices.

## Important limitations
- This is a frontend-only demo. The checkout does **not** charge money.
- The account page is not real authentication; do not enter real passwords.
- There is no backend, inventory service, or payment gateway.
- Prices, ratings, reviews, and product descriptions are sample data.
- Remote product images require an internet connection.

## Suggested next upgrades
1. Connect a backend API and database (for example Node.js + Express + MySQL).
2. Add secure authentication and server-side order validation.
3. Integrate a payment provider in test mode.
4. Add automated tests and deploy the site.

## Tech stack
HTML5 · CSS3 · Vanilla JavaScript · localStorage · Responsive design
