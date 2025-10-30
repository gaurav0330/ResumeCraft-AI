DevOps Setup

This repo is wired for Docker, local compose, CI, and deployments to Vercel (client) and Render (server). Follow these steps to go live on free tiers.

1) Local with Docker Compose

- Prereqs: Docker Desktop.
- Create a .env file at repo root with your secrets (not committed):
  - DATABASE_URL=...
  - JWT_SECRET=...
  - CLOUDINARY_URL=...
- Start services:

```
docker compose up --build
```

- Client: http://localhost:3000
- Server GraphQL: http://localhost:4000/graphql
- Health: http://localhost:4000/healthz

Client build bakes NEXT_PUBLIC_GRAPHQL_URL as http://localhost:4000/graphql.

2) GitHub Actions CI

- On PRs/pushes: lint+build client, lint server.
- On pushes to main: builds and pushes images to GHCR:
  - ghcr.io/<owner>/resumecraft-client:<sha>
  - ghcr.io/<owner>/resumecraft-server:<sha>

No extra secrets needed for GHCR when using GITHUB_TOKEN.

3) Client Deploy (Vercel)

Two options:
- Easiest: connect the repo in Vercel, set root to client/. Vercel will auto-deploy.
- Via GitHub Actions (already added): add repo secrets VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID and push to main or run manually.
Note: Set NEXT_PUBLIC_GRAPHQL_URL in Vercel Project Environment Variables to your server URL (e.g., https://<render-app>.onrender.com/graphql).

4) Server Deploy (Render)

- Use Render Web Service connected to server/ and Dockerfile, or Node service with build command "npm ci && npx prisma generate" and start "node src/index.js".
- Env Vars on Render: PORT=4000, DATABASE_URL, JWT_SECRET, CLOUDINARY_URL, CLIENT_URL=https://<your-vercel-domain>
- Optional Deploy Hook: In Render, enable Deploy Hook and add GitHub secret RENDER_DEPLOY_HOOK. The Deploy Server workflow will push a GHCR image and then POST to the hook to redeploy.

Note: Free tiers can sleep; first request may be cold.

5) Container Registry

Images are pushed to GitHub Container Registry automatically on main.

6) Kubernetes (optional later)

Add manifests under devops/k8s/ and deploy to local k3d/minikube or a small VM with k3s. Wire CI to kubectl apply using cluster credentials stored as GitHub secrets.

Troubleshooting:
- If Prisma needs additional OS libs, they’re included for Alpine (openssl, libc6-compat).
- Ensure CLIENT_URL matches your client origin to satisfy CORS.
- For Next.js, environment variables with NEXT_PUBLIC_ are baked at build time.

