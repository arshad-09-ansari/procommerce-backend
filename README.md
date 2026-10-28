# ProCommerce Backend - 50+ APIs | MongoDB | Razorpay | RabbitMQ | Socket.io | Docker | CI/CD

## Architecture guides

- [HLD.md](./HLD.md) explains the system components, deployment, and major request flows.
- [LLD.md](./LLD.md) explains the source layout, routes, models, and detailed feature flows.

## Features (5 Year Dev Level)
- 52 APIs across Auth, Products, Orders, Payments, Cart, Admin, Notifications
- MongoDB with Mongoose, Indexing, Text Search
- Razorpay Integration: Create Order + Verify Signature + Webhook
- RabbitMQ Queues: ORDER_QUEUE, EMAIL_QUEUE, PAYMENT_QUEUE
- Redis for caching (ready)
- Private AWS S3 product-image storage (seller/admin uploads; signed reads)
- Socket.io for real-time order tracking: join_order_room, order:status_update, payment:success, admin:new_order
- JWT Auth + RBAC (user, seller, admin)
- Docker + docker-compose (API + Worker + Mongo + Redis + RabbitMQ)
- CI/CD GitHub Actions (tests/build on every push and PR; automatic GHCR image publish on push; optional ECS deploy)
- Rate limiting, Helmet, Winston Logger, Global Error Handler

## Quick Start (Windows PowerShell)
1. `Copy-Item .env.example .env` (only once); fill in Razorpay test keys as needed.
2. `docker compose up --build -d`
3. Check startup with `docker compose ps`; API: http://localhost:5000
   Health: http://localhost:5000/health
   RabbitMQ UI: http://localhost:15672 (guest/guest)
   Mongo: localhost:27017
4. Stop the services with `docker compose down` (add `-v` only if you also want to delete local MongoDB data).

Compose waits for MongoDB, Redis, and RabbitMQ health checks before starting the API and worker. The API container runs as a non-root user and has a Docker health check.
If a host port is already in use, set `API_HOST_PORT`, `MONGO_HOST_PORT`, `REDIS_HOST_PORT`, `RABBITMQ_HOST_PORT`, or `RABBITMQ_UI_HOST_PORT` in `.env` to an available port. These affect host access only; containers continue using their standard internal ports.

## Razorpay Test Flow
POST /api/v1/payments/create-intent { amount: 500, orderId }
-> Get razorpay_order_id
Frontend uses Razorpay Checkout with key_id
On success POST /api/v1/payments/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }

## Socket Test
Connect with socket.io client, emit join_order_room with orderId, listen for order:status_update

## Product image upload (private S3)
1. Copy `.env.example` to `.env`, set `AWS_REGION` and `S3_BUCKET`, and provide AWS credentials through the normal AWS SDK credential chain (locally) or an ECS task role (in AWS).
2. Keep S3 Block Public Access enabled. Grant the application role `s3:PutObject` and `s3:GetObject` only on `arn:aws:s3:::<bucket>/products/*`.
3. A seller/admin uploads one image using `POST /api/v1/products/images`, `Authorization: Bearer <token>`, and multipart field `image`. JPEG, PNG, and WebP files up to 5 MB are accepted.
4. Save the returned `image.url` in the product's `images` array. The URL remains stable; `GET /api/v1/products/images/{imageId}` redirects to a short-lived signed S3 URL. The read URL is public for product display, but the S3 object itself remains private.
5. `S3_SIGNED_URL_TTL_SECONDS` defaults to 300 and must be between 60 and 3600.

## GitHub Actions, GHCR, and ECS setup
Every push, pull request, and manual workflow run executes the test suite and builds the production Docker image. Every successful push publishes `ghcr.io/<owner>/<repository>:sha-<commit>` to GitHub Container Registry; pushes to the repository's default branch also update `:latest`. This uses the workflow's `GITHUB_TOKEN` and does not need AWS credentials.

To pull and run the published API image, make sure MongoDB, Redis, and RabbitMQ are reachable at the URLs in your `.env`, then run:

```powershell
docker login ghcr.io
docker pull ghcr.io/<owner>/<repository>:latest
docker run --name procommerce-api --env-file .env -p 5000:5000 ghcr.io/<owner>/<repository>:latest
```

Replace `<owner>/<repository>` with the lowercase GitHub owner and repository name. The API container needs the external service URLs in `.env`; a standalone `docker run` does not start MongoDB, Redis, or RabbitMQ. To run all local dependencies together instead, use `docker compose up --build -d`.

ECS deployment is optional and disabled by default. To enable it, set repository variable `ENABLE_ECS_DEPLOY` to `true`, then configure:

- GitHub secret `AWS_ROLE_TO_ASSUME`: IAM role ARN trusted by GitHub OIDC; do not use long-lived AWS access keys.
- GitHub repository variables `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_API_SERVICE`, `ECS_API_TASK_DEFINITION`, `ECS_WORKER_SERVICE`, and `ECS_WORKER_TASK_DEFINITION`.
- The ECS task definitions must already exist, use container names `api` and `worker`, and contain their runtime environment/secrets and execution/task roles. Both services use the image built from this repository.
- The GitHub OIDC role needs ECR push permissions and ECS task-definition/service deployment permissions. ECS task roles need the S3 permissions above.
- Create the ECR repository, ECS cluster, API and worker services, and their task-definition revisions before enabling deployment. The task definitions must use container names `api` and `worker`. Configure the ECS task roles/runtime environment separately; do not put runtime credentials in the workflow.

Deployment cannot succeed until these account-specific GitHub settings and AWS resources are configured. Without the opt-in variable, pushes still test/build and publish to GHCR and do not attempt an AWS deployment.

## API List
See src/routes/* - Total 52 endpoints

## Interview Points to Say
- Decoupled order creation via RabbitMQ to keep latency <100ms
- Idempotent Razorpay verification using HMAC SHA256
- Socket rooms per orderId for tracking
- Separate worker service consuming queues
- Dockerized microservice ready