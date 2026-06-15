# Jenash E-Commerce

A Ghanaian marketplace web app — buy, sell, pay (Mobile Money / card / cash on delivery), and track orders. Built with **React + Vite**, ready for **GitHub + Vercel**.

## Features
- **Storefront & shop** — categories, search, product detail, cart.
- **Buyer / Seller registration** — sign up to *buy* (shop + track) or *sell* (open a shop, list products that appear in the store instantly, see incoming orders).
- **Checkout** — delivery address, courier choice, and Ghana payment methods: MTN MoMo, Telecel Cash, AirtelTigo Money, Card, Cash on Delivery.
- **Order tracking** — buyer dashboard with All / Processing / In Transit / Delivered tabs and a 6-stage delivery timeline.
- **Courier sign-up** — delivery companies register and then appear as a pickup option at checkout.
- **Contact** — WhatsApp, two call lines, email, and Accra location.
- **Logo splash** on open, navy & orange brand throughout, fully responsive with a mobile bottom-nav.

## Run locally
```bash
npm install
npm run dev        # open the printed http://localhost:5173
npm run build      # production build into /dist
```

## Deploy to GitHub + Vercel
1. **Create a GitHub repo** and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Jenash e-commerce"
   git branch -M main
   git remote add origin https://github.com/<you>/jenash.git
   git push -u origin main
   ```
2. Go to **vercel.com → Add New → Project → Import** your repo.
3. Vercel auto-detects Vite. Defaults are correct:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. You get a live URL in ~1 minute.

## Data & payments — important
This is a **frontend MVP**. Accounts, products, orders and couriers are stored in the **browser's localStorage**, so data lives on each visitor's device and payments are **simulated** (no real charge).

To make it a true live marketplace you'll add a backend:
- **Database + API** (e.g. Supabase, Firebase, or a Node/Express + Postgres server) for shared users, products, orders, couriers.
- **Paystack** for real payments — it supports cards *and* Mobile Money in Ghana. Verify every transaction **server-side** before marking an order paid. The checkout flow here is structured to drop that call in.
- **Courier notifications** (SMS/email/webhook) when a courier is selected for an order.

## Replace the logo
The brand is drawn as crisp vector in `src/Logo.jsx`. Your uploaded artwork is included at `public/jenash-brand.png` (used as the social share image). To swap in your own file, edit `src/Logo.jsx` or point the header at an `<img>`.

## Project structure
```
index.html
vite.config.js
vercel.json
public/         favicon.svg, jenash-brand.png
src/
  main.jsx      app entry
  App.jsx       all screens & logic
  Logo.jsx      vector brandmark
  data.js       catalog, couriers, constants
  storage.js    localStorage helpers
  index.css     styles
```
