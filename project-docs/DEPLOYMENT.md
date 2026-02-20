# CampusConnect — Deployment Guide

This document outlines a practical deployment approach for the CampusConnect MERN application.

---

## 1) Backend Deployment (Node.js + Express)

### Recommended Options

- Render / Railway / Fly.io (simple)
- AWS EC2 / DigitalOcean (full control)
- PM2 + Nginx (for VPS)

### Build/Run Commands

Backend is a standard Node server:

```bash
npm install
npm start
```

For development:

```bash
npm run dev
```

### Required Environment Variables

Configure these on the hosting provider:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<very_strong_secret>
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=30
```

Notes:

- Use MongoDB Atlas in production (recommended).
- Ensure `JWT_SECRET` is not exposed.

### Static Uploads (`/uploads`)

Backend serves uploaded files via:

- `GET /uploads/<filename>`

Production considerations:

- On serverless platforms, local disk may not persist.
- For long-term reliability, use object storage (S3/Cloudinary) in future.

### CORS

Current backend enables CORS globally. In production, restrict allowed origins:

- Only allow your frontend domain(s)

### Process Management (PM2)

The backend includes scripts for cluster mode:

- `npm run cluster`

Example PM2 usage:

```bash
pm2 start ecosystem.config.js
pm2 logs
pm2 restart ecosystem.config.js
```

---

## 2) Frontend Deployment (React + Vite)

### Recommended Options

- Vercel
- Netlify
- Cloudflare Pages

### Build Command

```bash
npm install
npm run build
```

Vite output is generated in `dist/`.

### Runtime Environment Variables

Set the API base URL:

```env
VITE_API_BASE_URL=https://<your-backend-domain>/api
```

Important:

- Vite env variables are baked into the build. Update and rebuild when the API URL changes.

---

## 3) End-to-End Configuration Checklist

- Backend deployed and reachable:
  - `https://<backend>/api`
- Frontend configured with:
  - `VITE_API_BASE_URL=https://<backend>/api`
- Database reachable from backend network
- JWT settings:
  - secure secret
  - appropriate expiration

---

## 4) Production Best Practices

### Security

- Use HTTPS everywhere
- Set strong `JWT_SECRET`
- Add rate limiting (e.g., `express-rate-limit`)
- Add security headers (e.g., `helmet`)
- Validate and sanitize input payloads

### Observability

- Centralized logging (provider logs / Winston)
- Track errors (Sentry)

### Database

- Enable IP allowlist / network rules (Atlas)
- Backups and monitoring
- Use indexes already defined in schemas

### Reliability

- Use PM2 cluster mode for multi-core utilization on VPS
- Configure health checks
- Use environment-specific configs

---

## 5) Smoke Test After Deployment

- `GET /` (backend root) should return API welcome payload
- Register + login
- Create event (admin)
- Register event (student)
- Create company visit with logo (admin)
- Apply to company visit (student)
