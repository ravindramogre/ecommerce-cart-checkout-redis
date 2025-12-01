# ecommerce-cart-checkout-redis

A demo ecommerce application (Node + TypeScript backend with Redis, React frontend with Vite) that implements cart and checkout flows with a discount-code feature.

**Assignment / Problem Statement**

"Assignment
You are designing an ecommerce store. Clients can add items to their cart and checkout to successfully place an order. Every nth order gets a coupon code for 10% discount and can apply to their cart.

We would like you to design and implement APIs for adding items to cart and checkout functionality. The checkout API would validate if the discount code is valid before giving the discount.

Building a UI that showcases the functionality is a stretch goal. If you are primarily a backend engineer, you can also submit postman or REST client or equivalent.

The store also has two admin API's:

Generate a discount code if the condition above is satisfied.
Lists count of items purchased, total purchase amount, list of discount codes and total discount amount.
You can build this with a technology stack that you are comfortable with. You would push the code to your github repo and share the link once its complete. We would like to see your commits that show progression and thought process as to how you are completing the exercise.

Things that you will be evaluated on:

Functional code
Code quality
UI in a framework of your choice
Code comments, readme docs
Unit tests
Assumptions you can make:

The API’s don’t need a backend store. It can be an in-memory store.
FAQ:
Q: Can a discount code be used multiple times?

A: Discount code can be requested by every user, but is made available for every nth order only. The discount code can be used only once before the next one becomes available on the next nth order.

Q: Does the discount code apply to one item?

A: Discount code applies to the entire order.

All the best!"

**Repository Overview**

- Backend: `backend/` — Node.js + TypeScript, uses `ioredis` for Redis interactions.
- Frontend: `frontend/` — React (Vite) app demonstrating product list and cart UI.
- The app uses Redis for persisting products, carts, coupons, and order counters.

**High-level Architecture**

- Clients call frontend UI which talks to backend API `http://localhost:4000/api/v1`.
- Backend stores product metadata and per-user carts in Redis and exposes endpoints under `/api/v1`.
- The backend also exposes admin endpoints for generating/listing coupons and stats.

**Key files**

- Backend entry: `backend/src/index.ts`
- Redis client: `backend/src/redisClient.ts`
- Seed products: `backend/src/seedProducts.ts`
- Cart, product, checkout routes: `backend/src/routes/` (see `cart.ts`, `checkout.ts`, `products.ts`, `admin.ts`)
- Frontend entry: `frontend/src/main.jsx`
- React components: `frontend/src/components/` (`ProductList.jsx`, `CartView.jsx`)
- Cart context provider: `frontend/src/cart/CartContext.jsx` (global state so adds update cart immediately)

**API Endpoints (implemented)**

- `GET /api/v1/products` — list products
- `GET /api/v1/cart` — fetch current user's cart (headers: `x-user-id` is set by frontend api util)
- `POST /api/v1/cart/items` — add item to cart (body: `{ productId, quantity }`)
- `POST /api/v1/cart/apply-coupon` — apply coupon code to cart (body: `{ couponCode }`)
- `POST /api/v1/checkout` — perform checkout for current user
- `POST /api/v1/admin/generate-coupon` — admin: generate coupon if nth order condition met
- `GET /api/v1/admin/stats` — admin: get stats (items purchased, total amount, coupon list, total discounted)

Refer to the backend `routes` for exact request/response shapes.

**Frontend global state**

- The frontend uses a React Context provider at `frontend/src/cart/CartContext.jsx`.
- `useCart()` exposes: `cart`, `products`, `loading`, `addToCart`, `applyCoupon`, `checkout`, `refresh`.
- `ProductList.jsx` calls `addToCart` from the context so the `CartView.jsx` updates immediately.

**Setup & Run (local)**

Prerequisites:
- Node.js (>=14)
- Redis server running locally on `localhost:6379` (or set `REDIS_URL`)

Backend:

```bash
cd backend
npm install
# ensure Redis is running (see below)
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Start Redis (macOS with Homebrew):
```bash
brew install redis
brew services start redis
redis-cli ping # should return PONG
```
If you don't have Homebrew, use Docker:
```bash
docker run -d -p 6379:6379 redis:latest
```

**Environment variables**

- `VITE_API_URL` — (optional) frontend override backend base URL. Default: `http://localhost:4000/api/v1`
- `REDIS_URL` — (optional) backend Redis connection string. Default: `redis://localhost:6379`

**Testing & Manual API Checks**

Use the UI to test flows, or `curl` / Postman. Example `curl` requests (frontend supplies `x-user-id` header automatically if you use the UI):

Add to cart:
```bash
curl -X POST http://localhost:4000/api/v1/cart/items \
	-H "Content-Type: application/json" \
	-H "x-user-id: user-abc" \
	-d '{"productId":"p1","quantity":1}'
```

Checkout:
```bash
curl -X POST http://localhost:4000/api/v1/checkout \
	-H "x-user-id: user-abc"
```

Admin generate coupon (example):
```bash
curl -X POST http://localhost:4000/api/v1/admin/generate-coupon
```

**Assumptions & Notes**

- The system gives a coupon every nth order (configured in backend). Coupon applies to entire order and can be used only once.
- The app uses Redis for persistence; if Redis is not running the backend will fail to connect (`ioredis` max retries error).
- Frontend generates a demo `x-user-id` and stores it in `localStorage` to simulate per-user carts.

**Evaluation checklist**

- Functional code: implemented cart, add-item, apply-coupon, checkout.
- Code quality: TypeScript on backend, small React components on frontend, Context for global state.
- UI: small React app demonstrating product listing and cart.
- README: this document explains setup, APIs, and assumptions.
- Unit tests: (If included in repo) run via `npm test` in respective folders.

**Next steps / Improvements**

- Add unit/integration tests for backend endpoints.
- Add robust error handling and retry/backoff logic around Redis client.
- Add pagination and better product metadata.
- Add logging and observability for admin stats generation.

If you'd like, I can also:
- add `Postman` collection examples,
- make `addToCart` optimistic on the frontend (immediately update UI before backend responds), or
- change the backend to return the updated cart for all cart operations consistently.

---

If anything is unclear or you'd like the README expanded with specific examples (Postman, tests, or deployment), tell me what to add and I'll update it.

