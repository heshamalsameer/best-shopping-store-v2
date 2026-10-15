# Best Shopping

An online store for developer gear built with **Next.js 14 (App Router)**, **Prisma + PostgreSQL**, **Redux Toolkit** and **Tailwind CSS**.

## Features
- Product catalogue with search, pagination and reviews
- Cart with quantities, live totals, free-shipping progress and discount codes (`WELCOME10`, `DEV20`)
- Checkout with shipping details and **simulated card payment** or cash on delivery
- Orders page with status tracker (Pending → Paid → Processing → Shipped → Delivered), history and printable invoice; customers can cancel before shipping
- **Live support chat** (Stream Chat): customers chat with the team from `/support` (or “Need help with this order?”); admins answer from the dashboard inbox with unread counts, typing indicators and read receipts
- Admin dashboard: stats, add / edit products (Cloudinary upload or image link), manage comments and update order status

## Demo accounts
| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@bestshopping.dev | demo1234 |
| Admin | admin@gmail.com | 123456 |

Test cards (no real money): `4242 4242 4242 4242` approved · `4000 0000 0000 0002` declined — any future expiry and any CVC.

## Getting started
```bash
cp .env.example .env          # fill DATABASE_URL, JWT_SECRET, Cloudinary and Stream keys
npm install                   # also runs `prisma generate`
npm run db:migrate            # applies prisma/migrations
npm run db:seed               # creates the demo accounts (+ products if empty)
npm run dev                   # http://localhost:3000
```

### Support chat (Stream)
1. Create a free app on [getstream.io](https://getstream.io/dashboard) (Chat product).
2. Copy the app's **Key** and **Secret** into `STREAM_API_KEY` / `STREAM_API_SECRET`.
3. Restart the server. Each customer gets a private channel `support-<userId>` shared with all admins — nothing else to configure.

### Cloudinary
Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and an **unsigned** upload preset in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (Cloudinary → Settings → Upload → Upload presets). Without them the admin form still works with a pasted image URL.
