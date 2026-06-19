# Baby Planet BD Clone — Backend (Express + TypeScript + Prisma + Redis)

Phase 1 backend foundation for the Baby Planet BD e-commerce clone. Built with **Express 4 + TypeScript 5**, **Prisma 6 (PostgreSQL 16)**, and **Redis 7 (ioredis)**.

## 📦 Stack

| Layer            | Tech                                              |
|------------------|---------------------------------------------------|
| HTTP server      | Express 4                                         |
| Language         | TypeScript 5 (strict mode)                        |
| ORM              | Prisma 6 (PostgreSQL provider)                    |
| Cache / Rate limiter | Redis 7 via ioredis + rate-limit-redis        |
| Auth (Phase 2)   | JWT (HttpOnly cookies) + Google OAuth 2.0         |
| Security         | helmet, cors, bcryptjs, express-rate-limit        |
| Validation       | zod                                               |
| Dev tooling      | tsx (watch mode), ESLint, Prettier                |

## 🗂️ Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema w/ explicit indexing
│   └── seed.ts              # 5 categories × 5 products = 25 seed products
├── src/
│   ├── config/
│   │   ├── env.ts           # Typed env loader (fails fast)
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── redis.ts         # Redis client + cache helpers + key builders
│   │   └── logger.ts        # Tiny leveled logger
│   ├── middlewares/
│   │   ├── error-handler.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── routes/
│   │   └── health.routes.ts # /api/v1/health — Docker & uptime probes
│   ├── controllers/         # (Phase 2)
│   ├── services/            # (Phase 2)
│   ├── jobs/                # (Phase 2 — cron cache invalidation etc.)
│   ├── types/
│   ├── utils/
│   ├── lib/
│   └── index.ts             # Express bootstrap entry point
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── package.json
└── tsconfig.json
```

## 🚀 Quick start

### 1. Start PostgreSQL + Redis via Docker

From the project root:

```bash
cp backend/.env.example backend/.env
# edit backend/.env with strong secrets before deploying

docker compose up -d
```

Services will be reachable on:
- PostgreSQL → `localhost:5432`
- Redis → `localhost:6379`
- Adminer (DB GUI) → http://localhost:8080
- Redis Insight → http://localhost:8001

### 2. Install backend deps & run migrations

```bash
cd backend
npm install                # or: bun install
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3. Start the dev server

```bash
npm run dev                # tsx watch — auto-reload on save
```

Backend will be live at **http://localhost:4000/api/v1/health**

## 📊 Seeded data summary

- **3 users** (1 admin + 2 customers)
- **5 categories**
- **25 products** (5 per category, real names + ৳ pricing in paisa)
- **1 sample coupon** (WELCOME10 — 10% off, min ৳500, max ৳200)

**Admin login:** `admin@babyplanet.bd` / `Admin#1234`

## 🧱 Prisma schema highlights

All foreign-key columns carry explicit `@@index`. Natural keys (`slug`, `email`, `phone`, `sku`) carry `@@unique`. Compound indexes power the admin dashboard's most common queries:

```prisma
// Power dashboard "show recent orders in status X"
@@index([status, createdAt])

// Power product reviews listing (approved reviews only)
@@index([productId, status])
```

Prices are stored as **integer paisa** (`BigInt`) to avoid float drift — display layer divides by 100.

## 🛡️ Cache strategy (Phase 2 preview)

| Cache key                            | TTL      | Invalidated on                |
|--------------------------------------|----------|-------------------------------|
| `products:list:{params-base64}`      | 5 min    | product create/update/delete  |
| `products:detail:{slug}`             | 2 min    | product update/delete         |
| `products:featured`                  | 5 min    | product update (isFeatured)   |
| `categories:tree`                    | 10 min   | category create/update/delete |
| `categories:{slug}:products:p{n}`    | 5 min    | product create/delete         |

Invalidation helpers live in `src/config/redis.ts` → `cache.delByPattern()`.

## 🧪 Scripts

| Script                  | What it does                                  |
|-------------------------|-----------------------------------------------|
| `npm run dev`           | tsx watch — hot-reload dev server             |
| `npm run build`         | Compile TS → `dist/`                          |
| `npm start`             | Run compiled `dist/index.js`                  |
| `npm run lint`          | ESLint                                        |
| `npm run typecheck`     | tsc --noEmit                                  |
| `npm run prisma:generate` | Generate Prisma Client                      |
| `npm run prisma:migrate:dev` | Create + apply dev migration              |
| `npm run prisma:migrate:deploy` | Apply migrations in production          |
| `npm run prisma:seed`   | Seed 25 products + 3 users + coupon           |
| `npm run db:reset`      | Reset DB + reseed                             |

## ⏭️ Next: Phase 2

Phase 2 will fill in:
- `controllers/auth.controller.ts` (JWT login/register + Google OAuth callback)
- `middlewares/auth.middleware.ts` (role-based route protection)
- `controllers/category.controller.ts`, `product.controller.ts`, `order.controller.ts`
- Redis cache layer with invalidation hooks on every admin mutation
- Order status state machine (PENDING → PROCESSING → SHIPPED → COMPLETED | CANCELLED)
