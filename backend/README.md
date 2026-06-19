# Baby Planet BD Clone — Backend (Express + TypeScript + Prisma + Redis)

Phase 2 backend: **Express 4 + TypeScript 5** with full JWT auth, Google OAuth 2.0, role-based access control, Redis-cached CRUD for Categories / Products / Orders, and an order status state machine.

## 📦 Stack

| Layer                | Tech                                              |
|----------------------|---------------------------------------------------|
| HTTP server          | Express 4                                         |
| Language             | TypeScript 5 (strict mode)                        |
| ORM                  | Prisma 6 (PostgreSQL provider)                    |
| Cache / Rate limiter | Redis 7 via ioredis + rate-limit-redis            |
| Auth                 | JWT (HttpOnly cookies) + Google OAuth 2.0 (passport) |
| Password hashing     | bcryptjs (cost factor 12)                         |
| Security             | helmet, cors, express-rate-limit                  |
| Validation           | zod (per-endpoint schemas)                        |
| Dev tooling          | tsx (watch mode), ESLint, Prettier                |

## 🗂️ Folder structure (Phase 2)

```
backend/
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema w/ explicit indexing
│   └── seed.ts              # 25 products + 3 users + coupon
├── src/
│   ├── config/
│   │   ├── env.ts           # Typed env loader
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── redis.ts         # Redis + cache helpers + key builders
│   │   ├── logger.ts        # Leveled logger
│   │   └── passport.ts      # Google OAuth 2.0 strategy
│   ├── middlewares/
│   │   ├── auth.middleware.ts          # authenticate + requireRole
│   │   ├── validate.middleware.ts      # Zod schema validator
│   │   ├── error-handler.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── product.controller.ts
│   │   └── order.controller.ts
│   ├── services/
│   │   ├── auth.service.ts             # register / login / refresh / Google upsert
│   │   ├── category.service.ts         # CRUD + Redis cache
│   │   ├── product.service.ts          # CRUD + filters + Redis cache
│   │   └── order.service.ts            # state machine + stock + coupons
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── product.routes.ts
│   │   └── order.routes.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── category.validator.ts
│   │   ├── product.validator.ts
│   │   └── order.validator.ts
│   ├── utils/
│   │   ├── jwt.ts                      # sign/verify access + refresh tokens
│   │   ├── async-handler.ts            # Promise error catcher
│   │   ├── api-response.ts             # Standardized JSON + AppError
│   │   ├── order-number.ts             # BP-YYYY-NNNNNN generator (Redis INCR)
│   │   └── paisa.ts                    # BDT ⇄ paisa conversion
│   ├── types/
│   │   └── express.d.ts                # Augment Request with `user`
│   └── index.ts                        # Express bootstrap
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── package.json
└── tsconfig.json
```

## 🚀 Quick start

### 1. Start PostgreSQL + Redis via Docker

```bash
cp backend/.env.example backend/.env   # fill in real secrets
docker compose up -d
```

### 2. Install backend deps & run migrations

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3. Start the dev server

```bash
npm run dev                # http://localhost:4000/api/v1/health
```

## 🔐 Auth flow

| Endpoint                          | Method | Auth       | Description                            |
|-----------------------------------|--------|------------|----------------------------------------|
| `/api/v1/auth/register`           | POST   | Public     | Email + password registration          |
| `/api/v1/auth/login`              | POST   | Public     | Email + password login                 |
| `/api/v1/auth/refresh`            | POST   | Cookie     | Exchange refresh token → access token  |
| `/api/v1/auth/logout`             | POST   | Public     | Clears cookies, revokes refresh token  |
| `/api/v1/auth/me`                 | GET    | Bearer     | Get current user profile               |
| `/api/v1/auth/me`                 | PATCH  | Bearer     | Update name / phone / avatar           |
| `/api/v1/auth/change-password`    | POST   | Bearer     | Change password (invalidates sessions) |
| `/api/v1/auth/google`             | GET    | Public     | Redirect to Google consent             |
| `/api/v1/auth/google/callback`    | GET    | Public     | Handle Google redirect → set cookies   |
| `/api/v1/auth/google/dev`         | POST   | Public     | Dev-only Google login simulator        |

**Token strategy:**
- Access token: 15 min, signed with `JWT_ACCESS_SECRET`, set as HttpOnly cookie (`bp_token`)
- Refresh token: 7 days, signed with `JWT_REFRESH_SECRET`, JTI hashed and stored in DB (`refreshTokenHash`), set as HttpOnly cookie (`bp_refresh_token`) scoped to `/api/v1/auth`
- On every refresh: rotate the refresh token (issue new JTI, persist new hash)
- On logout / password change: clear `refreshTokenHash` → all existing refresh tokens become invalid

**Role-based middleware:**
- `authenticate` — verifies access token, attaches `req.user`
- `requireRole("ADMIN")` — admin-only gate
- `requireRole("ADMIN", "MANAGER")` — admin or manager gate
- `optionalAuth` — attaches `req.user` if token present, never throws

## 📂 Categories API

| Endpoint                          | Method | Auth  | Description              |
|-----------------------------------|--------|-------|--------------------------|
| `/api/v1/categories`              | GET    | Public | List categories (cached) |
| `/api/v1/categories/:slug`        | GET    | Public | Get category by slug     |
| `/api/v1/categories`              | POST   | Admin  | Create category          |
| `/api/v1/categories/:slug`        | PUT    | Admin  | Update category          |
| `/api/v1/categories/:slug`        | DELETE | Admin  | Delete (blocks if has products) |

## 🛍️ Products API

| Endpoint                          | Method | Auth   | Description                                |
|-----------------------------------|--------|--------|--------------------------------------------|
| `/api/v1/products`                | GET    | Public | Paginated list w/ filters (cached)         |
| `/api/v1/products/featured`       | GET    | Public | Featured products (cached)                 |
| `/api/v1/products/best-sellers`   | GET    | Public | Best sellers (cached)                      |
| `/api/v1/products/:slug`          | GET    | Public | Product detail (cached)                    |
| `/api/v1/products/:slug/related`  | GET    | Public | Related products in same category (cached) |
| `/api/v1/products`                | POST   | Admin  | Create product                             |
| `/api/v1/products/:id`            | PUT    | Admin  | Update product                             |
| `/api/v1/products/:id`            | DELETE | Admin  | Delete (soft-delete if has order history)  |

**List query params:** `page`, `pageSize`, `categoryId`, `categorySlug`, `search`, `status`, `visibility`, `isFeatured`, `isBestSeller`, `minPriceBdt`, `maxPriceBdt`, `tags` (comma-separated), `sort` (newest, price_asc, price_desc, name_asc, name_desc, best_selling, top_rated), `includeInactive`.

## 📦 Orders API

| Endpoint                          | Method | Auth    | Description                                |
|-----------------------------------|--------|---------|--------------------------------------------|
| `/api/v1/orders`                  | POST   | Public  | Create order (guest checkout supported)    |
| `/api/v1/orders`                  | GET    | Bearer  | List own orders (admin sees all)           |
| `/api/v1/orders/:id`              | GET    | Bearer  | Get order by ID (own or admin)             |
| `/api/v1/orders/stats`            | GET    | Admin   | Dashboard stats                            |
| `/api/v1/orders/:id/status`       | PATCH  | Admin   | Update status (state-machine-validated)    |

**State machine:**
```
PENDING ─────► PROCESSING ─────► SHIPPED ─────► COMPLETED
   │                │                │
   └────────────────┴────────────────┴──► CANCELLED
```
- On `SHIPPED`: requires `trackingNumber`, sets `shippedAt`
- On `COMPLETED`: sets `deliveredAt`, marks `paymentStatus=PAID`
- On `CANCELLED`: returns stock to inventory, sets `cancelledAt`
- Terminal states (`COMPLETED`, `CANCELLED`) cannot transition further

**Order creation side-effects (all in a single transaction):**
1. Validate product availability + stock
2. Generate order number `BP-YYYY-NNNNNN` via Redis INCR
3. Apply coupon if valid (percentage or fixed, with min/max caps)
4. Compute shipping (৳60 inside Dhaka, ৳120 outside)
5. Decrement product stock + increment `salesCount`
6. Increment coupon `usedCount`
7. Invalidate product cache (stock changed)

## ⚡ Redis cache layer

| Cache key                            | TTL   | Invalidated on                          |
|--------------------------------------|-------|-----------------------------------------|
| `products:list:{base64(params)}`     | 5 min | product create/update/delete, order create/status change |
| `products:detail:{slug}`             | 2 min | product update/delete, order status change (stock) |
| `products:featured`                  | 5 min | product create/update/delete            |
| `products:bestsellers`               | 5 min | product create/update/delete, order create |
| `products:related:{slug}`            | 5 min | product create/update/delete            |
| `categories:list:{params}`           | 10 min| category create/update/delete, product create/update/delete |
| `categories:detail:{slug}`           | 5 min | category create/update/delete           |

Invalidation helpers live in `services/category.service.ts` → `invalidateCategoryCache()` and `services/product.service.ts` → `invalidateProductCache()`. Both use `cache.delByPattern()` to wipe matching keys in a single SCAN loop.

## 🛡️ Security

- Passwords hashed with bcryptjs (cost factor 12)
- JWTs signed with separate secrets for access vs refresh
- Refresh token JTIs hashed before DB storage (DB leak doesn't expose tokens)
- HttpOnly + SameSite=Lax + Secure (production) cookies
- CORS locked to `CLIENT_URL` + `ADMIN_URL`
- Helmet security headers
- Rate limiting (300 req / 15 min per IP) backed by Redis
- Zod validation on every request body / query / params
- No SQL injection risk (Prisma parameterized queries)
- Order state machine prevents invalid transitions
- Stock decrement happens inside a DB transaction

## 🧪 Scripts

| Script                  | What it does                                  |
|-------------------------|-----------------------------------------------|
| `npm run dev`           | tsx watch — hot-reload dev server             |
| `npm run build`         | Compile TS → `dist/`                          |
| `npm start`             | Run compiled `dist/index.js`                  |
| `npm run lint`          | ESLint                                        |
| `npm run typecheck`     | tsc --noEmit                                  |
| `npm run prisma:seed`   | Seed 25 products + 3 users + coupon           |
| `npm run db:reset`      | Reset DB + reseed                             |

## ⏭️ Next: Phase 3

Phase 3 will build the Next.js storefront UI:
- Sticky nav header + mobile drawer
- Debounced search
- Cart drawer (Zustand)
- 4-field Bangla checkout
- Admin dashboard with shadcn/ui data-tables
