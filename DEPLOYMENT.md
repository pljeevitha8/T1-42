# 🚀 SketchTrace AI — Deployment Guide

This guide details multiple zero-friction deployment strategies for **SketchTrace AI**, including Docker, Cloud PaaS (Render, Railway, Fly.io, Koyeb), and local Node.js server deployment.

---

## ⚡ Option 1: One-Click Local / VM Run

Since the client and server are already pre-compiled in `client/dist` and `server/dist`:

### 1. Install Server Dependencies
```bash
cd server
npm install --omit=dev
```

### 2. Launch Full-Stack Server
```bash
npm start
```

Access the application immediately at: **`http://localhost:5000`**

---

## 🐳 Option 2: Docker Container (Production)

SketchTrace AI includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml`.

### Quick Docker Run
```bash
# Build and run with Docker Compose
docker compose up -d --build
```

Access the application at: **`http://localhost:5000`**

### Standalone Docker Build
```bash
docker build -t sketchtrace-ai .
docker run -d -p 5000:5000 --name sketchtrace sketchtrace-ai
```

---

## ☁️ Option 3: Deploy to Render.com / Railway / Koyeb

### Render.com (Web Service)
1. Push repository or upload archive to GitHub.
2. Create a new **Web Service** on Render.
3. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm --prefix server install && npm --prefix server run build && npm --prefix client install && npm --prefix client run build`
   - **Start Command:** `npm --prefix server run start`
   - **Port:** `5000`
4. Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-jwt-secret-here`
   - `DEFAULT_AI_PROVIDER=pollinations`

### Railway.app / Fly.io / Koyeb
Simply select "Deploy from Dockerfile" — Railway and Fly.io automatically detect the multi-stage `Dockerfile` and deploy with zero manual configuration.

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express server and static asset hosting |
| `NODE_ENV` | `production` | Node environment mode |
| `JWT_SECRET` | *(Included default)* | Secret key used to sign and verify forensic officer JWT tokens |
| `DEFAULT_AI_PROVIDER` | `pollinations` | Active sketch synthesis engine (`pollinations`, `huggingface`, `openai`, `procedural_demo`) |
| `AI_API_KEY` | *(Optional)* | Secret API key if using OpenAI or HuggingFace endpoints |
| `AI_MODEL_NAME` | `flux` | Model identifier for cloud diffusion calls |

---

## 👥 Built-In Officer Accounts (Ready for Evaluation)

All default accounts are pre-seeded with password: `Forensics2026!`

- **Admin / Lead Detective:** `lead.investigator@metro-forensics.gov`
- **Forensic Artist:** `artist.chen@metro-forensics.gov`
- **Field Reviewer:** `reviewer.guest@metro-forensics.gov`

Or use the **1-Click Quick Demo Login** card directly on the login screen.
