# ProCommerce Backend - Low-Level Design (LLD)

Yeh document code ke andar request routing, authentication, data structures,
queues aur key API flows ko detail mein samjhata hai. Route aur schema details
current source code par based hain; mock endpoints ko clearly mark kiya gaya hai.

## 1. Code ko kaise padhein

Ek aam HTTP request ka path:

```text
src/server.js
  -> src/routes/index.js
    -> src/routes/<feature>.routes.js
      -> src/middlewares/authMiddleware.js (agar protected route ho)
        -> src/controllers/<feature>.controller.js
          -> src/services/<feature>.service.js (jahan istemal ho)
            -> src/models/<feature>.model.js
              -> MongoDB
```

`asyncHandler` async controller errors ko `src/middlewares/errorMiddleware.js`
tak forward karta hai. Error middleware JSON mein `success: false` aur message
bhejta hai. Development mode mein stack trace bhi response mein aa sakta hai.

## 2. HTTP aur middleware

`src/server.js` mein:

- Helmet security-related HTTP headers set karta hai.
- CORS middleware cross-origin requests allow karta hai.
- Morgan request logs likhta hai.
- `express.json({ limit: '10mb' })` JSON bodies parse karta hai.
- `/api/v1` ke neeche feature routes mount hote hain.
- `/health` aur `/api/v1/health` health responses hain.
- Swagger UI `/api-docs`, JSON spec `/api-docs.json` par hai.

## 3. Authentication aur roles

1. Login/register JWT issue karte hain.
2. Client protected route par `Authorization: Bearer <token>` bhejta hai.
3. `protect` middleware JWT ko `JWT_SECRET` se verify karta hai aur MongoDB se
   user load karke `req.user` set karta hai.
4. `authorize('seller', 'admin')` jaise middleware allowed role verify karte hain.

Available roles: `user`, `seller`, `admin`. User password `bcryptjs` se hash
hota hai; password field default queries mein select nahi hota.

## 4. API route map

Sab feature routes `/api/v1` prefix ke neeche hain. JWT ka matlab route par
`protect` middleware lagu hai. `Mock` ka matlab route ka current handler
placeholder response deta hai, full business operation nahi.

### Auth - `/api/v1/auth`

| Method | Path | Access | Kaam / current status |
| --- | --- | --- | --- |
| POST | `/register` | Public; rate-limited | Naya user, JWT return |
| POST | `/login` | Public; rate-limited | Credentials check karke JWT return |
| POST | `/forgot-password` | Public | Mock reset-link response |
| POST | `/refresh-token` | Public | Mock response; token refresh flow nahi |
| GET | `/me` | JWT | Current user return |
| POST | `/logout` | JWT | Message return; server-side token revoke nahi |
| GET | `/verify-email` | Public | Mock success response |
| POST | `/reset-password` | Public | Mock success response |

### Products - `/api/v1/products`

| Method | Path | Access | Kaam / current status |
| --- | --- | --- | --- |
| GET | `/search?q=...` | Public | Product text search |
| GET | `/` | Public | Product list; category/search/page/limit/sort filters |
| GET | `/:id` | Public | Product detail |
| POST | `/` | Seller/admin + JWT | Product create |
| PUT | `/:id` | Seller/admin + JWT | Product update |
| DELETE | `/:id` | Admin + JWT | Product delete |
| POST | `/:id/reviews` | JWT | Mock review response |
| GET | `/category/:cat` | Public | Category filter ke saath product list |
| PUT | `/stock/bulk` | Admin + JWT | Mock bulk-stock response |

### Orders - `/api/v1/orders`

| Method | Path | Access | Kaam / current status |
| --- | --- | --- | --- |
| POST | `/create` | JWT | Order create, queue jobs publish, socket events emit |
| GET | `/my` | JWT | Current user's orders |
| GET | `/track/:id` | JWT | Order lookup; tracking ke liye shared lookup handler |
| GET | `/:id` | JWT | Order detail |
| PUT | `/:id/status` | Admin/seller + JWT | Order status update aur room event emit |
| GET | `/admin/all` | Admin + JWT | Sab orders |
| POST | `/:id/cancel` | JWT | Mock cancellation response |

### Payments - `/api/v1/payments`

| Method | Path | Access | Kaam / current status |
| --- | --- | --- | --- |
| POST | `/create-intent` | JWT | Razorpay order create |
| POST | `/verify` | JWT | Signature verify, payment save aur order paid update |
| POST | `/webhooks/razorpay` | Public | Signature check log; state processing abhi nahi |
| GET | `/history` | JWT | Current user's payment records |
| POST | `/refund` | JWT | Mock refund response |
| GET | `/invoice/:id` | JWT | Mock invoice response; PDF generate nahi hota |

### Cart - `/api/v1/cart`

Cart router ke sab endpoints par JWT required hai.

| Method | Path | Kaam / current status |
| --- | --- | --- |
| POST | `/` | Cart mein product add ya quantity increase |
| GET | `/` | Current user's cart |
| DELETE | `/:productId` | Cart se item remove |
| PUT | `/quantity` | `addToCart` handler hi chalta hai; alag quantity-update flow nahi |
| POST | `/wishlist/toggle` | Mock wishlist response |

### Admin - `/api/v1/admin`

Router ke sab endpoints par JWT aur admin role required hai.

| Method | Path | Kaam / current status |
| --- | --- | --- |
| GET | `/dashboard-stats` | User/product/order counts aur order totals |
| GET | `/users` | User list |
| GET | `/logs` | Mock logs response |

## 5. MongoDB collections / Mongoose models

| Model | Main fields | Relationships / notes |
| --- | --- | --- |
| `User` | `name`, `email`, `password`, `role`, `isVerified`, `avatar`, timestamps | Email unique/lowercase; role enum `user/seller/admin`; password bcrypt hash hota hai |
| `Product` | `name`, `description`, `price`, `stock`, `category`, `images`, `seller`, `ratings`, `isActive`, timestamps | `seller` User ref; name/category indexes aur name/description text index |
| `Cart` | `user`, `items[]`, timestamps | User ref; item mein Product ref aur quantity |
| `Order` | `user`, `items[]`, `totalAmount`, `shippingAddress`, `paymentInfo`, `orderStatus`, `paidAt`, timestamps | Item mein Product ref/quantity/price; payment info mein Razorpay IDs/status |
| `Payment` | `user`, `order`, Razorpay IDs/signature, `amount`, `currency`, `status`, timestamps | User aur Order refs; status `created/paid/failed/refunded` |
| `Notification` | `user`, `title`, `message`, `type`, `isRead`, `link`, timestamps | `type` `order/payment/system`; model available, par inspected routes mein notification flow mounted nahi |

## 6. Important request flows

### Register / login

```text
POST /api/v1/auth/register
  -> auth.routes.js (rate limiter)
  -> auth.controller.js
  -> auth.service.js: duplicate email check
  -> User.create(): password hash hook
  -> JWT issue
  -> { user, token }
```

Login mein email se user find hota hai, password explicitly select hota hai,
`comparePassword` se check hota hai aur valid hone par JWT milta hai.

### Cart mein item add karna

```text
POST /api/v1/cart  [Bearer JWT]
  -> protect: JWT verify + User lookup
  -> cart.controller.addToCart
  -> current user ka Cart find/create
  -> same product ho to quantity increase, warna item push
  -> save + product populate
  -> cart JSON response
```

### Order create karna

```text
POST /api/v1/orders/create  [Bearer JWT]
  -> protect
  -> order.controller.createOrder
  -> order.service.createOrder
  -> MongoDB: pending Order create
  -> RabbitMQ: ORDER_QUEUE aur EMAIL_QUEUE par jobs publish
  -> Socket.IO: admin:new_order aur order:placed emit
  -> HTTP 201 order response
```

Queue payloads mein order/user IDs aur job `type` hota hai. Worker queues declare
karta hai aur in jobs ko consume karta hai. Current worker actual email send ya
order-side effect nahi karta; log/delay ke baad message acknowledge karta hai.

### Payment

1. `POST /payments/create-intent` amount ko Razorpay API ko bhejta hai; service
   INR ko paise mein convert karti hai (`amount * 100`).
2. Client Razorpay checkout complete karke order/payment IDs aur signature
   `POST /payments/verify` ko bhejta hai.
3. Service `razorpay_order_id|razorpay_payment_id` par HMAC-SHA256 signature
   banakar `RAZORPAY_KEY_SECRET` se compare karti hai.
4. Valid signature par Payment record banta hai aur linked Order ko paid mark
   karne ki koshish hoti hai. Payment success queue aur socket event bhi hote hain.

Webhook route is verify flow se alag hai. Abhi woh webhook signature validity
log karta hai, lekin invalid signature par request reject ya event par payment
update nahi karta.

## 7. RabbitMQ queues aur worker

| Queue | Publisher location | Worker ka current behavior |
| --- | --- | --- |
| `ORDER_QUEUE` | Order service | Job log + simulated delay + ack |
| `EMAIL_QUEUE` | Order service | Email job log + simulated delay + ack; email send nahi |
| `PAYMENT_QUEUE` | Payment service | Payment job log + ack |

Queue publish helper persistent message option use karta hai. Agar API ka
RabbitMQ channel available nahi, helper message log karke return karta hai;
current code mein yeh case durable retry/outbox nahi banata.

## 8. Socket.IO events

| Event | Direction / usage |
| --- | --- |
| `join_order_room` | Client order ID ke room mein join request bhejta hai |
| `order:status_update` | Status update par server us order room ko emit karta hai |
| `admin:new_order` | Order create hone par server global emit karta hai |
| `order:placed` | Order create hone par server global emit karta hai |
| `payment:success` | Payment verify hone par server global emit karta hai |
| `chat:message` | Client se aaya message server sab connected clients ko broadcast karta hai |

Socket connection ke liye authentication/authorization aur `join_order_room`
mein order ownership check current handler mein nahi hai.

## 9. Code samajhte waqt dhyan dene layak implementation gaps

- Order create handler request body se `items`, `totalAmount` aur doosra order
  data seedha save karta hai. Server-side price calculation, stock reservation
  ya order input validation is flow mein nahi dikh rahi.
- Order detail lookup ID se hota hai; controller user ownership check nahi karta.
  Isliye `protect` login zaroor enforce karta hai, lekin apne-aap yeh ensure
  nahi karta ki requested order isi user ka hai.
- Seller/admin roles product create/update routes access karte hain, lekin
  update service product ke seller-owner ko compare nahi karti.
- Payment verify par `Payment` record ka `amount` abhi `0` set hota hai.
- Webhook signature compare simple string equality se hota hai aur result abhi
  payment update ya request rejection mein use nahi hota.
- `getRedis()` client provide karta hai, par routes/services mein Redis cache
  ya token persistence ka use nahi hai.

Yeh current code behavior ke notes hain; inhein supported/complete business
features samajhne ke bajaye implementation ki boundaries samjhein.

## 10. Configuration aur local run

`.env` ki values private rakhein. Code in environment variable names ko read
karta hai: `PORT`, `MONGO_URI`, `REDIS_URL`, `RABBITMQ_URL`, `JWT_SECRET`,
`JWT_EXPIRE`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, `NODE_ENV`.

Docker Compose se full stack start karne ke liye:

```powershell
docker compose up -d --build
docker compose ps
```

API: `http://localhost:5000`; Swagger UI: `http://localhost:5000/api-docs`;
health endpoint: `http://localhost:5000/health`; RabbitMQ UI:
`http://localhost:15672`.

Compose `depends_on` sirf startup ordering deta hai, readiness nahi. RabbitMQ
startup par der se ready ho to worker/API logs dekh kar service readiness aur
connection verify karein:

```powershell
docker compose logs --tail 100 api worker rabbitmq
```

## 11. Samajhne ke liye source files

- `src/server.js` - application entry point
- `src/routes/` - route-to-controller mapping
- `src/controllers/` - HTTP input/output
- `src/services/` - auth, order, payment aur product operations
- `src/models/` - MongoDB schema definitions
- `src/middlewares/authMiddleware.js` - JWT aur role checks
- `src/config/` - external service connections
- `src/workers/consumer.js` - queue consumers
- `src/sockets/socketHandler.js` - real-time event handlers
